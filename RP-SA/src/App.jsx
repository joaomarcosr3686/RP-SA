import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './lib/supabaseClient';
import logoImg from './assets/logo.png';
import imgMecanica from './assets/mecanica.png';
import imgInjecao from './assets/injecao.png';
import imgFreios from './assets/suspensao.png';
import imgarCondicionado from './assets/ar-condicionado.png';
import imgRetifica from './assets/retifica.png';
import imgSlide1 from './assets/imagem1.jpg';
import imgSlide2 from './assets/imagem2.jpg';

import Header from './components/Header';
import MyAccount from './components/MyAccount';
import MeusCarros from './components/MyCars';

const slides = [imgSlide1, imgSlide2];

const servicosData = [
  { 
    id: 'mecanica', titulo: 'Mecânica Geral e Revisão', img: imgMecanica, 
    desc: 'Revisão completa e minuciosa do seu veículo para garantir segurança e performance.', 
    sintomas: 'Barulhos anormais na rodagem, perda de potência ou pequenos vazamentos no chão da garagem.', 
    feito: 'Troca de óleo, substituição de filtros, inspeção de correias, verificação de fluidos e aperto geral do motor.' 
  },
  { 
    id: 'injecao', titulo: 'Diagnóstico de Injeção Eletrônica', img: imgInjecao, 
    desc: 'Análise computadorizada avançada de todos os sensores do sistema de injeção.', 
    sintomas: 'Luz da injeção acesa no painel, consumo excessivo de combustível ou engasgos ao acelerar.', 
    feito: 'Limpeza de bicos injetores, troca de velas e cabos, e rastreamento completo via scanner.' 
  },
  { 
    id: 'freios', titulo: 'Suspensão, Freios e Geometria', img: imgFreios, 
    desc: 'Manutenção preventiva e corretiva focada na estabilidade e frenagem do veículo.', 
    sintomas: 'Volante tremendo em alta velocidade, assobios ao frear ou carro puxando para um lado.', 
    feito: 'Troca de pastilhas e discos, substituição de amortecedores, além de alinhamento e balanceamento 3D.' 
  },
  { 
    id: 'ar', titulo: 'Ar-Condicionado', img: imgarCondicionado, 
    desc: 'Manutenção completa do sistema de climatização da cabine.', 
    sintomas: 'O ar demora para gelar, cheiro de mofo ao ligar ou ruídos metálicos no compressor.', 
    feito: 'Higienização dos dutos, recarga de gás refrigerante, teste de estanqueidade e troca do filtro de cabine.' 
  },
  { 
    id: 'retifica', titulo: 'Retífica de Motores', img: imgRetifica, 
    desc: 'Restauração pesada e completa de motores desgastados ou fundidos.', 
    sintomas: 'Fumaça branca ou azulada no escapamento, motor superaquecendo rápido ou baixando muito óleo.', 
    feito: 'Desmontagem total, usinagem do bloco e cabeçote, substituição de anéis, pistões e bronzinas.' 
  },
];

function App() {
  const [paginaAtual, setPaginaAtual] = useState('inicio');
  const [slideAtual, setSlideAtual] = useState(0);
  const [servicoExpandido, setServicoExpandido] = useState(null);
  
  // O modalAberto agora pode ser: 'termos', 'privacidade', 'sobre', 'estrutura' ou null
  const [modalAberto, setModalAberto] = useState(null);

  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideAtual((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); 
    return () => clearInterval(intervalo);
  }, []);

  // Sincroniza o estado de login com a sessão real do Supabase.
  // Isso resolve o bug de "login por cima de outro": a fonte da verdade
  // passa a ser a sessão do Supabase, e não um estado solto/localStorage.
  useEffect(() => {
    const resolverNome = async (user) => {
      if (!user) return null;
      const { data: perfil } = await supabase
        .from('profiles')
        .select('nome_completo')
        .eq('id', user.id)
        .maybeSingle();
      return (
        perfil?.nome_completo ||
        user.user_metadata?.nome_completo ||
        user.email.split('@')[0]
      );
    };

    // Sessão inicial (ao recarregar a página).
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUsuarioLogado(await resolverNome(session?.user));
    });

    // Atualizações em tempo real (login, logout, refresh de token).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUsuarioLogado(await resolverNome(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  // Acessibilidade: fecha o modal ativo ao pressionar ESC.
  useEffect(() => {
    if (!modalAberto) return;
    const aoPressionarTecla = (e) => {
      if (e.key === 'Escape') setModalAberto(null);
    };
    window.addEventListener('keydown', aoPressionarTecla);
    return () => window.removeEventListener('keydown', aoPressionarTecla);
  }, [modalAberto]);

  // Logout: encerra a sessão no Supabase e volta para o início.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuarioLogado(null);
    setPaginaAtual('inicio');
  };

  const handleContact = () => {
    const msg = encodeURIComponent("Olá RP Serviços Automotivos, gostaria de um orçamento!");
    window.open(`https://wa.me/554830561212?text=${msg}`, '_blank');
  };

  const toggleServico = (idServico) => {
    setServicoExpandido(servicoExpandido === idServico ? null : idServico);
  };

  return (
    <div className="container-geral">
      <Header 
        logo={logoImg} 
        onContact={handleContact} 
        setPaginaAtual={setPaginaAtual} 
        usuarioLogado={usuarioLogado}
        onLogout={handleLogout}
      />

      <main className="conteudo-principal">
        
        {(paginaAtual === 'inicio' || paginaAtual === 'encontre') && (
          <>
            {/* CARROSSEL CORRIGIDO PARA RESOLUÇÃO 1856x576 */}
            <div className="carrossel-honda" style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
              <div 
                className="carrossel-slides-container" 
                style={{ 
                  display: 'flex', 
                  width: `${slides.length * 100}%`, 
                  transform: `translateX(-${(slideAtual * 100) / slides.length}%)`,
                  transition: 'transform 0.8s ease-in-out'
                }}
              >
                {slides.map((slide, index) => (
                  <div 
                    key={index} 
                    className="slide" 
                    style={{ 
                      backgroundImage: `url(${slide})`, 
                      width: `${100 / slides.length}%`, 
                      aspectRatio: '1856 / 576', /* A mágica que impede o corte da imagem em qualquer tela! */
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      flexShrink: 0 /* Impede que o celular esprema o slide */
                    }}
                  />
                ))}
              </div>
            </div>

            <h2 className="titulo-secao">PRINCIPAIS SERVIÇOS</h2>
            <div className="galeria-servicos">
              <div className="card-servico" onClick={() => setPaginaAtual('servicos')} style={{cursor: 'pointer'}}><img src={imgMecanica} alt="Mecânica" className="foto-servico" /><p>Mecânica Geral</p></div>
              <div className="card-servico" onClick={() => setPaginaAtual('servicos')} style={{cursor: 'pointer'}}><img src={imgInjecao} alt="Injeção" className="foto-servico" /><p>Injeção Eletrônica</p></div>
              <div className="card-servico" onClick={() => setPaginaAtual('servicos')} style={{cursor: 'pointer'}}><img src={imgFreios} alt="Freios" className="foto-servico" /><p>Suspensão e Freios</p></div>
            </div>

            <div className="mapa-container" id="mapa-rp">
              <h2 className="titulo-secao">ENCONTRE-NOS</h2>
              <p>R. Vadislau Demboski, 556 - Nossa Sra. de Fátima, Içara - SC</p>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.033621437633!2d-49.314643!3d-28.711124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQyJzQwLjAiUyA0OcKwMTgnNTIuNyJX!5e0!3m2!1spt-BR!2sbr!4v1625000000000!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="400" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
              ></iframe>
            </div>
          </>
        )}

        {paginaAtual === 'servicos' && (
          <div className="pagina-servicos">
            <h2 className="titulo-secao">NOSSOS SERVIÇOS COMPLETOS</h2>
            <p className="servicos-subtitulo">Toque em um serviço para ver os detalhes completos</p>

            <div className="lista-servicos-coluna">
              {servicosData.map((servico) => {
                const aberto = servicoExpandido === servico.id;
                return (
                  <div
                    key={servico.id}
                    className={`card-servico-longo ${aberto ? 'expandido' : ''}`}
                    onClick={() => toggleServico(servico.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={aberto}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleServico(servico.id); } }}
                  >
                    <div className="card-servico-topo">
                      <img src={servico.img} alt={servico.titulo} className="card-servico-img" />
                      <div className="card-servico-info">
                        <h3 className="card-servico-titulo">{servico.titulo}</h3>
                        <p className="card-servico-resumo">{servico.desc}</p>
                        <span className="card-expandir-indicador">
                          {aberto ? 'Ocultar detalhes' : 'Toque para expandir detalhes'}
                          <i className="card-chevron" aria-hidden="true" />
                        </span>
                      </div>
                    </div>

                    <div className={`card-servico-detalhes ${aberto ? 'aberto' : ''}`}>
                      <div className="card-servico-detalhes-inner">
                        <p><strong>Descrição:</strong> {servico.desc}</p>
                        <p><strong>Quando revisar:</strong> {servico.sintomas}</p>
                        <p><strong>O que é feito:</strong> {servico.feito}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {paginaAtual === 'conta' && (
          usuarioLogado ? (
            // Bug corrigido: já logado não pode acessar login/cadastro de novo.
            <div className="conta-container">
              <div className="conta-box" style={{ textAlign: 'center' }}>
                <h2>Você já está conectado</h2>
                <p style={{ color: '#555', margin: '10px 0 24px 0', lineHeight: 1.6 }}>
                  Olá, <strong>{usuarioLogado}</strong>! Você já tem uma sessão ativa.
                  Para entrar com outra conta, saia primeiro.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    className="btn-submit-conta"
                    onClick={() => setPaginaAtual('meus-carros')}
                  >
                    IR PARA MEUS CARROS
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{ padding: '14px', backgroundColor: '#fff', color: '#e50914', border: '2px solid #e50914', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
                  >
                    SAIR DA CONTA
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <MyAccount 
              onLogin={setUsuarioLogado} 
              setPaginaAtual={setPaginaAtual}
              onOpenTerms={() => setModalAberto('termos')}
              onOpenPrivacy={() => setModalAberto('privacidade')}
            />
          )
        )}

        {paginaAtual === 'meus-carros' && (
          <MeusCarros 
            usuarioLogado={usuarioLogado}
            onOpenTerms={() => setModalAberto('termos')}
          />
)}

      </main>

      {/* JANELAS MODAIS DINÂMICAS */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setModalAberto(null)}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            
            {modalAberto === 'termos' && (
              <>
                <h3 style={{ borderBottom: '2px solid #e50914', paddingBottom: '10px' }}>Termos de Uso</h3>
                <p style={{ textAlign: 'left', whiteSpace: 'pre-line', color: '#444', fontSize: '15px', marginTop: '15px', lineHeight: '1.6' }}>
                  Ao utilizar os serviços da RP Serviços Automotivos, você concorda em fornecer dados cadastrais verídicos para a realização de ordens de serviço e orçamentos. Suas informações de login são de uso pessoal e intransferível. Garantimos a correta execução dos serviços prestados em nossa oficina mecânica conforme as normas vigentes.
                </p>
              </>
            )}

            {modalAberto === 'privacidade' && (
              <>
                <h3 style={{ borderBottom: '2px solid #e50914', paddingBottom: '10px' }}>Política de Privacidade</h3>
                <p style={{ textAlign: 'left', whiteSpace: 'pre-line', color: '#444', fontSize: '15px', marginTop: '15px', lineHeight: '1.6' }}>
                  A RP Serviços Automotivos tem o compromisso de proteger sua privacidade. Os dados coletados no cadastro (Nome, CPF/CNPJ, E-mail e Telefone) são guardados de forma segura e utilizados estritamente para o controle interno de atendimentos, histórico do veículo, emissão de notas fiscais e envio de orçamentos via WhatsApp. Não compartilhamos seus dados com terceiros.
                </p>
              </>
            )}

            {modalAberto === 'sobre' && (
              <>
                <h3 style={{ borderBottom: '2px solid #e50914', paddingBottom: '10px' }}>Sobre a RP Serviços</h3>
                <p style={{ textAlign: 'left', color: '#444', fontSize: '15px', marginTop: '15px', lineHeight: '1.6' }}>
                  A RP Serviços Automotivos nasceu da paixão pela mecânica e pelo compromisso em entregar resultados de excelência. Nós não apenas trocamos peças, nós diagnosticamos e resolvemos o problema do seu veículo com total transparência. Trabalhamos com as melhores ferramentas e peças do mercado para garantir que seu carro saia da nossa oficina com segurança e performance máxima. Seu bem maior é a vida, e nós cuidamos da máquina que transporta você.
                </p>
              </>
            )}

            {modalAberto === 'estrutura' && (
              <>
                <h3 style={{ borderBottom: '2px solid #e50914', paddingBottom: '10px' }}>Nossa Estrutura</h3>
                <p style={{ textAlign: 'left', color: '#444', fontSize: '15px', marginTop: '15px', lineHeight: '1.6' }}>
                  Contamos com um espaço amplo e limpo, equipado com elevadores modernos e ferramentas de diagnóstico computadorizado avançadas para atender desde revisões básicas até retíficas complexas.
                </p>
                {/* ESPAÇO RESERVADO PARA A FOTO DA ESTRUTURA */}
                <div style={{ width: '100%', height: '250px', backgroundColor: '#f0f0f0', border: '2px dashed #bbb', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                  <span style={{ color: '#888', fontWeight: '500' }}>[Foto da Oficina Aqui]</span>
                </div>
              </>
            )}

            <button onClick={() => setModalAberto(null)} style={{ marginTop: '25px', padding: '12px 20px', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '16px' }}>FECHAR</button>
          </div>
        </div>
      )}

      <footer className="rodape-honda">
        <div className="rodape-principal">
          <div className="rodape-logo-redes">
            <img src={logoImg} alt="RP Logo" className="logo-rodape" />
            <h3>Siga nas redes sociais</h3>
            <div className="icones-redes">
              <a href="https://www.instagram.com/rpservicosautomotivos_" target="_blank" rel="noopener noreferrer" style={{textDecoration: "none"}} className="link-rodape">
                📷 @rpservicosautomotivos_
              </a>
            </div>
          </div>
          
          <div className="rodape-links">
            <div className="coluna-links">
              <h4>RP Serviços</h4>
              {/* BOTÕES SOBRE E ESTRUTURA ATIVADOS */}
              <a onClick={() => setModalAberto('sobre')} style={{cursor: 'pointer'}}>Sobre nós</a>
              <a onClick={() => setModalAberto('estrutura')} style={{cursor: 'pointer'}}>Nossa Estrutura</a>
              <a href="mailto:rp10ponto@gmail.com?subject=Curriculo%20-%20RP%20Servicos%20Automotivos&body=Olá,%20gostaria%20de%20enviar%20meu%20currículo." className="botao-trabalhe-conosco">
                Trabalhe Conosco
              </a>
            </div>
            <div className="coluna-links">
              <h4>Serviços</h4>
              <a onClick={() => setPaginaAtual('servicos')} style={{cursor: 'pointer'}}>Mecânica Geral</a>
              <a onClick={() => setPaginaAtual('servicos')} style={{cursor: 'pointer'}}>Injeção</a>
              <a onClick={() => setPaginaAtual('servicos')} style={{cursor: 'pointer'}}>Ar-Condicionado</a>
            </div>
            <div className="coluna-links">
              <h4>Contato</h4>
              <a href="https://wa.me/554830561212" target="_blank" rel="noreferrer">(48) 3056-1212</a>
              <a href="mailto:rp10ponto@gmail.com">rp10ponto@gmail.com</a>
              <a href="#mapa-rp">Içara - SC</a>
            </div>
          </div>
        </div>
        
        <div className="rodape-cinza">
          <p>DESACELERE. SEU BEM MAIOR É A VIDA.</p>
          <div className="rodape-cinza-links">
            <a onClick={() => setModalAberto('privacidade')} style={{cursor: 'pointer'}}>Política de privacidade</a>
            <a onClick={() => setModalAberto('termos')} style={{cursor: 'pointer'}}>Termos de uso</a>
            <span>Copyright © RP Serviços Automotivos - CNPJ: 36.338.745/0001-02</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
