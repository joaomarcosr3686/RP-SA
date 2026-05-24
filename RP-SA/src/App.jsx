import { useState, useEffect } from 'react';
import './App.css';
import logoImg from './assets/logo.png';
import imgMecanica from './assets/mecanica.png';
import imgInjecao from './assets/injecao.png';
import imgFreios from './assets/suspensao.png';
import imgSlide1 from './assets/imagem1.jpg';
import imgSlide2 from './assets/imagem2.jpg';
import imgRetifica from './assets/retifica.png';
import imgarCondicionado from './assets/ar-condicionado.png';

import Header from './components/Header';
import MinhaConta from './components/MinhaConta';
import TermosModal from './components/TermosModal';

const slides = [imgSlide1, imgSlide2];

// Dados dos serviços com descrições detalhadas
const servicosData = [
  {
    id: 'mecanica',
    titulo: 'Mecânica Geral e Revisão',
    imagem: imgMecanica,
    descricao: 'Realizamos manutenção completa do seu veículo, incluindo troca de óleo, filtros, correias, velas, embreagem e muito mais. Nossa equipe é especializada em todas as marcas e modelos.',
    sintomas: [
      'Ruídos estranhos no motor ou rodas',
      'Dificuldade para dar partida',
      'Consumo excessivo de combustível',
      'Vazamentos de fluidos',
      'Quilometragem para revisão atingida'
    ],
    oqueFazemos: [
      'Diagnóstico completo do veículo',
      'Troca de óleo e filtros',
      'Verificação de correias e tensores',
      'Inspeção de velas e bobinas',
      'Checagem de níveis de fluidos'
    ]
  },
  {
    id: 'injecao',
    titulo: 'Diagnóstico de Injeção Eletrônica',
    imagem: imgInjecao,
    descricao: 'Utilizamos equipamentos de última geração para diagnosticar e resolver problemas no sistema de injeção eletrônica do seu veículo, garantindo melhor desempenho e economia.',
    sintomas: [
      'Luz de injeção acesa no painel',
      'Motor falhando ou engasgando',
      'Perda de potência',
      'Consumo anormal de combustível',
      'Marcha lenta irregular'
    ],
    oqueFazemos: [
      'Leitura e apagamento de códigos de falha',
      'Limpeza de bicos injetores',
      'Teste de sensores e atuadores',
      'Reprogramação de módulos',
      'Substituição de componentes defeituosos'
    ]
  },
  {
    id: 'suspensao',
    titulo: 'Suspensão, Freios e Geometria',
    imagem: imgFreios,
    descricao: 'Cuidamos da segurança do seu veículo com serviços de suspensão, freios e alinhamento. Trabalhamos com peças de qualidade para garantir sua tranquilidade ao dirigir.',
    sintomas: [
      'Veículo puxando para um lado',
      'Desgaste irregular dos pneus',
      'Barulhos ao passar em buracos',
      'Pedal de freio baixo ou esponjoso',
      'Vibração no volante ao frear'
    ],
    oqueFazemos: [
      'Troca de amortecedores e molas',
      'Substituição de bandejas e pivôs',
      'Troca de pastilhas e discos de freio',
      'Alinhamento e balanceamento',
      'Geometria computadorizada'
    ]
  },
  {
    id: 'ar',
    titulo: 'Manutenção de Ar-Condicionado',
    imagem: imgarCondicionado,
    descricao: 'Oferecemos serviços completos de ar-condicionado automotivo, desde a simples recarga de gás até reparos no compressor e evaporador.',
    sintomas: [
      'Ar não gela como antes',
      'Mau cheiro ao ligar o ar',
      'Ruídos ao acionar o sistema',
      'Vazamento de água dentro do carro',
      'Ar condicionado não liga'
    ],
    oqueFazemos: [
      'Recarga de gás refrigerante',
      'Higienização do sistema',
      'Troca do filtro de cabine',
      'Reparo de compressor',
      'Verificação de vazamentos'
    ]
  },
  {
    id: 'retifica',
    titulo: 'Retífica de Motores',
    imagem: imgRetifica,
    descricao: 'Serviço especializado de retífica de motores, recuperando a performance original do seu veículo. Trabalhamos com precisão e qualidade.',
    sintomas: [
      'Consumo excessivo de óleo',
      'Fumaça branca ou azul no escapamento',
      'Perda significativa de potência',
      'Superaquecimento do motor',
      'Ruídos internos no motor'
    ],
    oqueFazemos: [
      'Desmontagem e análise do motor',
      'Retífica de cabeçote e bloco',
      'Troca de anéis, bronzinas e juntas',
      'Usinagem de peças',
      'Montagem e teste do motor'
    ]
  }
];

function App() {
  const [paginaAtual, setPaginaAtual] = useState('inicio');
  const [slideAtual, setSlideAtual] = useState(0);
  const [fadeSlide, setFadeSlide] = useState(true);
  const [servicoExpandido, setServicoExpandido] = useState(null);
  const [modalTermos, setModalTermos] = useState({ aberto: false, tipo: '' });

  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const handleLogout = () => {
    setUsuarioLogado(null);
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFadeSlide(false);
      setTimeout(() => {
        setSlideAtual((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        setFadeSlide(true);
      }, 300);
    }, 4000); 
    
    return () => clearInterval(intervalo);
  }, []);

  const handleContact = () => {
    const msg = encodeURIComponent("Olá RP Serviços Automotivos, gostaria de um orçamento!");
    window.open(`https://wa.me/554830561212?text=${msg}`, '_blank');
  };

  const toggleServico = (id) => {
    setServicoExpandido(servicoExpandido === id ? null : id);
  };

  const abrirModal = (tipo) => {
    setModalTermos({ aberto: true, tipo });
  };

  const fecharModal = () => {
    setModalTermos({ aberto: false, tipo: '' });
  };

  return (
    <div className="container-geral">
      <Header 
        logo={logoImg} 
        onContact={handleContact} 
        setPaginaAtual={setPaginaAtual} 
        usuarioLogado={usuarioLogado}
      />

      <main className="conteudo-principal">
        
        {(paginaAtual === 'inicio' || paginaAtual === 'encontre') && (
          <>
            <div className="carrossel-honda">
              <div 
                className={`slide ${fadeSlide ? 'fade-in' : 'fade-out'}`} 
                style={{ backgroundImage: `url(${slides[slideAtual]})` }}
              >
              </div>
            </div>

            <h2 className="titulo-secao">PRINCIPAIS SERVIÇOS</h2>
            <div className="galeria-servicos">
              <div className="card-servico"><img src={imgMecanica} alt="Mecânica" className="foto-servico" /><p>Mecânica Geral</p></div>
              <div className="card-servico"><img src={imgInjecao} alt="Injeção" className="foto-servico" /><p>Injeção Eletrônica</p></div>
              <div className="card-servico"><img src={imgFreios} alt="Freios" className="foto-servico" /><p>Suspensão e Freios</p></div>
            </div>

            <div className="mapa-container" id="mapa-rp">
              <h2 className="titulo-secao">ENCONTRE-NOS</h2>
              <p>R. Vadislau Demboski, 556 - Nossa Sra. de Fátima, Içara - SC</p>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13998.722473076388!2d-49.321893483243315!3d-28.69919902603144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9521834dea4292ad%3A0x75f85afc5ca14d8!2sRP%20SERVI%C3%87OS%20AUTOMOTIVOS-MECANICA-ELETRICA-AR%20CONDICIONADO-MOTORES-SUSPENSAO-FREIOS-PNEUS!5e0!3m2!1spt-BR!2sbr!4v1779484544860!5m2!1spt-BR!2sbr" 
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
            <div className="lista-servicos-accordion">
              {servicosData.map((servico) => (
                <div key={servico.id} className="accordion-item">
                  <div 
                    className={`accordion-header ${servicoExpandido === servico.id ? 'ativo' : ''}`}
                    onClick={() => toggleServico(servico.id)}
                  >
                    <img src={servico.imagem} alt={servico.titulo} className="accordion-img" />
                    <p className="accordion-titulo">{servico.titulo}</p>
                    <span className={`accordion-seta ${servicoExpandido === servico.id ? 'aberta' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </span>
                  </div>
                  <div className={`accordion-content ${servicoExpandido === servico.id ? 'expandido' : ''}`}>
                    <div className="accordion-inner">
                      <div className="servico-secao">
                        <h4>Sobre o Serviço</h4>
                        <p>{servico.descricao}</p>
                      </div>
                      <div className="servico-secao">
                        <h4>Quando Procurar?</h4>
                        <ul>
                          {servico.sintomas.map((sintoma, idx) => (
                            <li key={idx}>{sintoma}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="servico-secao">
                        <h4>O Que Fazemos</h4>
                        <ul>
                          {servico.oqueFazemos.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <button className="btn-orcamento" onClick={handleContact}>
                        SOLICITAR ORÇAMENTO
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {paginaAtual === 'conta' && (
          <MinhaConta onLogin={setUsuarioLogado} onLogout={handleLogout} abrirModal={abrirModal} />
        )}

      </main>

      <footer className="rodape-honda">
        <div className="rodape-principal">
          <div className="rodape-logo-redes">
            <img src={logoImg} alt="RP Logo" className="logo-rodape" />
            <h3>Siga nas redes sociais</h3>
            <div className="icones-redes">
              <a href="https://www.instagram.com/rpservicosautomotivos_" target="_blank" rel="noopener noreferrer" textDecoration="none" className="link-rodape">
                📷 @rpservicosautomotivos_
              </a>
            </div>
          </div>
          
          <div className="rodape-links">
            <div className="coluna-links">
              <h4>RP Serviços</h4>
              <a>Sobre nós</a>
              <a>Nossa Estrutura</a>
              <a href="mailto:rp10ponto@gmail.com?subject=Curriculo%20-%20RP%20Servicos%20Automotivos&body=Olá,%20gostaria%20de%20enviar%20meu%20currículo." class="botao-trabalhe-conosco">
    Trabalhe Conosco
              </a>
            </div>
            <div className="coluna-links">
              <h4>Serviços</h4>
              <a>Mecânica Geral</a>
              <a>Injeção</a>
              <a>Ar-Condicionado</a>
            </div>
            <div className="coluna-links">
              <h4>Contato</h4>
              <a>(48) 3056-1212</a>
              <a>rp10ponto@gmail.com</a>
              <a>Içara - SC</a>
            </div>
          </div>
        </div>
        
        <div className="rodape-cinza">
          <p>DESACELERE. SEU BEM MAIOR É A VIDA.</p>
          <div className="rodape-cinza-links">
            <a onClick={() => abrirModal('privacidade')} style={{cursor: 'pointer'}}>Política de privacidade</a>
            <a onClick={() => abrirModal('termos')} style={{cursor: 'pointer'}}>Termos de uso</a>
            <span>Copyright © RP Serviços Automotivos - CNPJ: 36.338.745/0001-02</span>
          </div>
        </div>
      </footer>

      <TermosModal 
        aberto={modalTermos.aberto} 
        tipo={modalTermos.tipo} 
        onClose={fecharModal} 
      />
    </div>
  );
}

export default App;
