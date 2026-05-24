export default function TermosModal({ aberto, tipo, onClose }) {
  if (!aberto) return null;

  const conteudoTermos = {
    termos: {
      titulo: 'Termos de Uso',
      texto: `
TERMOS DE USO - RP SERVIÇOS AUTOMOTIVOS

Última atualização: Janeiro de 2024

1. ACEITAÇÃO DOS TERMOS
Ao acessar e utilizar os serviços da RP Serviços Automotivos, você concorda com estes Termos de Uso. Caso não concorde com algum termo, solicitamos que não utilize nossos serviços.

2. SERVIÇOS OFERECIDOS
A RP Serviços Automotivos oferece serviços de mecânica geral, injeção eletrônica, suspensão, freios, ar-condicionado automotivo e retífica de motores. Todos os serviços são realizados por profissionais qualificados seguindo as normas técnicas vigentes.

3. ORÇAMENTOS E PREÇOS
- Os orçamentos são gratuitos e válidos por 7 (sete) dias.
- Os preços podem variar de acordo com o modelo do veículo e a complexidade do serviço.
- Serviços adicionais identificados durante a execução serão comunicados ao cliente antes da realização, mediante nova aprovação.

4. GARANTIA DOS SERVIÇOS
- Oferecemos garantia de 90 (noventa) dias para mão de obra.
- Peças substituídas possuem garantia conforme o fabricante.
- A garantia não cobre mau uso, acidentes ou adulteração do serviço realizado.

5. RESPONSABILIDADES DO CLIENTE
- Fornecer informações corretas sobre o veículo e os problemas apresentados.
- Retirar o veículo no prazo acordado.
- Efetuar o pagamento conforme combinado.

6. FORMAS DE PAGAMENTO
Aceitamos pagamento em dinheiro, PIX, cartão de débito e crédito. Parcelamento disponível conforme condições vigentes.

7. CANCELAMENTO
O cliente pode cancelar o serviço a qualquer momento antes do início da execução, sem custos. Após o início, serão cobrados os valores proporcionais ao trabalho já realizado.

8. DISPOSIÇÕES GERAIS
Estes termos podem ser atualizados periodicamente. Recomendamos a leitura regular desta página.

Para dúvidas, entre em contato pelo WhatsApp (48) 3056-1212 ou pelo e-mail rp10ponto@gmail.com.
      `
    },
    privacidade: {
      titulo: 'Política de Privacidade',
      texto: `
POLÍTICA DE PRIVACIDADE - RP SERVIÇOS AUTOMOTIVOS

Última atualização: Janeiro de 2024

A RP Serviços Automotivos está comprometida em proteger a privacidade dos dados pessoais de nossos clientes, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

1. DADOS COLETADOS
Coletamos apenas os dados necessários para a prestação dos nossos serviços:
- Nome completo
- CPF ou CNPJ
- Telefone/WhatsApp
- E-mail
- Dados do veículo (quando aplicável)

2. FINALIDADE DO USO DOS DADOS
Seus dados são utilizados exclusivamente para:
- Cadastro e identificação do cliente
- Comunicação sobre serviços e orçamentos
- Emissão de notas fiscais
- Garantia dos serviços prestados
- Histórico de manutenções do veículo

3. COMPARTILHAMENTO DE DADOS
Não compartilhamos, vendemos ou alugamos seus dados pessoais a terceiros. Os dados podem ser compartilhados apenas:
- Quando exigido por lei ou ordem judicial
- Para emissão de notas fiscais junto aos órgãos competentes

4. ARMAZENAMENTO E SEGURANÇA
- Os dados são armazenados em sistemas seguros com criptografia.
- Mantemos backups regulares para evitar perda de informações.
- O acesso aos dados é restrito a funcionários autorizados.

5. SEUS DIREITOS
Conforme a LGPD, você tem direito a:
- Confirmar a existência de tratamento de dados
- Acessar seus dados pessoais
- Corrigir dados incompletos ou desatualizados
- Solicitar a exclusão de dados desnecessários
- Revogar o consentimento a qualquer momento

6. RETENÇÃO DOS DADOS
Mantemos seus dados pelo período necessário para cumprir as finalidades descritas ou conforme exigido por lei. Dados de notas fiscais são mantidos pelo prazo legal de 5 (cinco) anos.

7. COOKIES
Nosso site pode utilizar cookies para melhorar a experiência de navegação. Você pode configurar seu navegador para recusar cookies.

8. CONTATO
Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
- WhatsApp: (48) 3056-1212
- E-mail: rp10ponto@gmail.com
- Endereço: R. Vadislau Demboski, 556 - Nossa Sra. de Fátima, Içara - SC

9. ALTERAÇÕES
Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas através dos nossos canais de comunicação.
      `
    }
  };

  const conteudo = conteudoTermos[tipo] || { titulo: '', texto: '' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-fechar" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 className="modal-titulo">{conteudo.titulo}</h2>
        <div className="modal-conteudo">
          <pre className="modal-texto">{conteudo.texto}</pre>
        </div>
        <button className="modal-btn-fechar" onClick={onClose}>
          ENTENDI
        </button>
      </div>
    </div>
  );
}
