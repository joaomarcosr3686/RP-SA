import { useState, useEffect } from 'react';
import './App.css';
import logoImg from './assets/logo.png';
import imgMecanica from './assets/mecanica.png';
import imgInjecao from './assets/injecao.png';
import imgFreios from './assets/suspensao.png';
import imgSlide1 from './assets/imagem1.jpg';
import imgSlide2 from './assets/imagem2.jpg';
import imgRetifica from '.assets/retifica';
import imgarCondicionado from '.assets/ar-condicionado';

import Header from './components/Header';
import MinhaConta from './components/MinhaConta';

const slides = [imgSlide1, imgSlide2];

function App() {
  const [paginaAtual, setPaginaAtual] = useState('inicio');
  const [slideAtual, setSlideAtual] = useState(0);

  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const handleLogout = () => {
    setUsuarioLogado(null);
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideAtual((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000); 
    
    return () => clearInterval(intervalo);
  }, []);

  const handleContact = () => {
    const msg = encodeURIComponent("Olá RP Serviços Automotivos, gostaria de um orçamento!");
    window.open(`https://wa.me/554830561212?text=${msg}`, '_blank');
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
              <div className="slide" style={{ backgroundImage: `url(${slides[slideAtual]})` }}>
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
            <div className="lista-servicos-detalhada">
               <div className="card-servico"><img src={imgMecanica} alt="Mecânica" className="foto-servico" /><p>Mecânica Geral e Revisão</p></div>
               <div className="card-servico"><img src={imgInjecao} alt="Injeção" className="foto-servico" /><p>Diagnóstico de Injeção Eletrônica</p></div>
               <div className="card-servico"><img src={imgFreios} alt="Freios" className="foto-servico" /><p>Suspensão, Freios e Geometria</p></div>
               <div className="card-servico"><img src={imgarCondicionado} alt="Ar-Condicionado" classname="foto-servico" /><p>Manutenção de Ar-Condicionado</p></div>
               <div className="card-servico"><img src={imgRetifica} alt="Retifica" classname="foto-servico" /> <p>Retifica</p></div>
            </div>
          </div>
        )}

        {paginaAtual === 'conta' && (
          <MinhaConta onLogin={setUsuarioLogado} onLogout={handleLogout} />
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
            <a>Política de privacidade</a>
            <a>Termos de uso</a>
            <span>Copyright © RP Serviços Automotivos - CNPJ: 36.338.745/0001-02</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
