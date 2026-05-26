import { useState } from 'react';

export default function Header({ logo, onContact, setPaginaAtual, usuarioLogado }) {
  const [menuAberto, setMenuAberto] = useState(false);

  const irPara = (pagina) => {
    setPaginaAtual(pagina);
    setMenuAberto(false);
    if (pagina === 'encontre') {
      setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 300);
    }
  };

  return (
    <header className="header-fixo">
      {/* Mensagem foi removida daqui! */}
      <div className="menu-hamburguer" onClick={() => setMenuAberto(true)}>
        <div className="barrinha"></div><div className="barrinha"></div><div className="barrinha"></div>
      </div>
      
      <div className="header-logo" onClick={() => irPara('inicio')} style={{cursor: 'pointer'}}>
        <img src={logo} alt="RP Logo" className="logo-img" />
      </div>

      <button className="btn-interesse-whats" onClick={onContact}>
        <span className="icon-whats-btn"></span> ENTRE EM CONTATO
      </button>

      <div className={`menu-lateral ${menuAberto ? 'aberto' : ''}`}>
        <button className="fechar-menu" onClick={() => setMenuAberto(false)}>X</button>
        
        {/* === MENSAGEM DE BOAS VINDAS ESTILIZADA === */}
        <div 
          className="menu-saudacao" 
          style={{
            color: '#ffffff', // Força a cor do texto para branco
            fontSize: '20px', // Aumenta o tamanho da letra
            fontWeight: 'bold', // Deixa em negrito
            padding: '20px 20px 15px 20px', // Dá um respiro em volta do texto
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Cria uma linha sutil separando a saudação dos botões
            marginBottom: '15px'
          }}
        >
          {usuarioLogado ? `Olá, ${usuarioLogado}!` : 'Bem-vindo(a)!'}
          
          {/* Subtítulo pequeno caso o usuário não esteja logado */}
          {!usuarioLogado && (
            <span style={{ display: 'block', fontSize: '13px', color: '#aaaaaa', fontWeight: 'normal', marginTop: '5px' }}>
              Faça login para acessar seus serviços
            </span>
          )}
        </div>

        <nav>
          <a onClick={() => irPara('inicio')}>Início</a>
          <a onClick={() => irPara('servicos')}>Serviços</a>
          <a onClick={() => irPara('encontre')}>Encontre-nos</a>
          <a onClick={() => irPara('conta')}>Minha Conta</a>

          {usuarioLogado && (
    <a onClick={() => irPara('meus-carros')} style={{ color: '#e50914', fontWeight: 'bold' }}>Meus Carros</a>
  )}
  
  <a onClick={() => irPara('conta')}>Minha Conta</a>
        </nav>
      </div>
      {menuAberto && <div className="fundo-escuro-menu" onClick={() => setMenuAberto(false)}></div>}
    </header>
  );
}