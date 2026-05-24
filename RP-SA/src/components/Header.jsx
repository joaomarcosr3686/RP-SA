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
        
        {/* === MENSAGEM DE BOAS VINDAS MOVIDA PRA CÁ === */}
        <div className="menu-saudacao">
          {usuarioLogado ? `Olá, ${usuarioLogado}!` : 'Bem-vindo(a)!'}
        </div>

        <nav>
          <a onClick={() => irPara('inicio')}>Início</a>
          <a onClick={() => irPara('servicos')}>Serviços</a>
          <a onClick={() => irPara('encontre')}>Encontre-nos</a>
          <a onClick={() => irPara('conta')}>Minha Conta</a>
        </nav>
      </div>
      {menuAberto && <div className="fundo-escuro-menu" onClick={() => setMenuAberto(false)}></div>}
    </header>
  );
}