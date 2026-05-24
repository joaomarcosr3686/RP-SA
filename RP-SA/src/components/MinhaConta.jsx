import { useState } from 'react';

export default function MinhaConta({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    usuario: '', nome: '', cpf: '', email: '', senha: '', confSenha: '', termos: false
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleHoldPassword = (e) => { e.preventDefault(); setShowPassword(true); };
  const handleReleasePassword = () => setShowPassword(false);

  // === MATEMÁTICA REAL DE VALIDAÇÃO DE CPF E CNPJ ===
  const validarCpfCnpj = (val) => {
    const doc = val.replace(/\D/g, '');
    if (doc.length === 11) return validarCPF(doc);
    if (doc.length === 14) return validarCNPJ(doc);
    return false;
  };

  const validarCPF = (cpf) => {
    if (/^(\d)\1+$/.test(cpf)) return false; // Bloqueia 111.111.111-11
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  const validarCNPJ = (cnpj) => {
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2, numeros = cnpj.substring(0, tamanho), digitos = cnpj.substring(tamanho), soma = 0, pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    tamanho = tamanho + 1; numeros = cnpj.substring(0, tamanho); soma = 0; pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    return true;
  };
  // ===================================================

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      const contasSalvas = JSON.parse(localStorage.getItem('rp_contas')) || [];
      const contaExiste = contasSalvas.find(c => c.usuario === form.usuario && c.senha === form.senha);
      if (contaExiste) {
        localStorage.setItem('rp_logado', JSON.stringify(contaExiste));
        onLogin(contaExiste.usuario);
        alert('Login efetuado com sucesso!');
      } else {
        alert('Usuário ou senha incorretos!');
      }
    } else {
      if (form.senha !== form.confSenha) return alert('As senhas não coincidem!');
      if (!form.termos) return alert('Aceite os termos de uso!');
      if (!validarCpfCnpj(form.cpf)) return alert('CPF ou CNPJ INVÁLIDO! Digite um documento real.');

      const novaConta = { usuario: form.usuario, nome: form.nome, cpf: form.cpf, email: form.email, senha: form.senha };
      const contasSalvas = JSON.parse(localStorage.getItem('rp_contas')) || [];
      if (contasSalvas.find(c => c.usuario === form.usuario)) return alert('Usuário já existe!');
      
      contasSalvas.push(novaConta);
      localStorage.setItem('rp_contas', JSON.stringify(contasSalvas));
      alert('Conta criada com sucesso! Faça login.');
      setIsLogin(true);
    }
  };

  return (
    <div className="conta-container">
      <div className="conta-box">
        <h2>{isLogin ? 'Acessar Conta' : 'Criar Conta'}</h2>
        <form onSubmit={handleSubmit} className="form-conta">
          <input type="text" name="usuario" placeholder="Usuário" required onChange={handleChange} />
          {!isLogin && (
            <>
              <input type="text" name="nome" placeholder="Nome Completo" required onChange={handleChange} />
              <input type="text" name="cpf" placeholder="CPF/CNPJ (Apenas números)" required onChange={handleChange} />
              <input type="email" name="email" placeholder="E-mail" required onChange={handleChange} />
            </>
          )}
          <div className="senha-input-box">
            <input type={showPassword ? "text" : "password"} name="senha" placeholder="Senha" required onChange={handleChange} />
            <button type="button" onMouseDown={handleHoldPassword} onMouseUp={handleReleasePassword} onMouseLeave={handleReleasePassword} onTouchStart={handleHoldPassword} onTouchEnd={handleReleasePassword} className="btn-ver-senha">👁️</button>
          </div>
          {!isLogin && (
            <>
              <input type="password" name="confSenha" placeholder="Confirmar Senha" required onChange={handleChange} />
              <label className="termos-label">
                <input type="checkbox" name="termos" required onChange={(e) => setForm({...form, termos: e.target.checked})} />
                Aceito os termos de uso e políticas de privacidade
              </label>
            </>
          )}
          <button type="submit" className="btn-submit-conta">{isLogin ? 'ENTRAR' : 'CADASTRAR'}</button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} className="toggle-conta">{isLogin ? 'Não tem conta? Crie uma.' : 'Já tem conta? Faça login.'}</p>
      </div>
    </div>
  );
}