/* =============================================================
   main.js — Loja de Roupas | Sistema de Atendimento
   Comportamentos: dark mode, sidebar, flash, validações
   ============================================================= */


/* -------------------------------------------------------------
   1. DARK MODE
   Lê a preferência salva no navegador e aplica na hora,
   antes de o usuário ver qualquer "piscada" de tema errado.
   ------------------------------------------------------------- */

/**
 * Aplica o tema (claro ou escuro) ao elemento <html>.
 * @param {boolean} escuro - true para modo escuro
 */
function aplicarTema(escuro) {
  document.documentElement.classList.toggle('dark', escuro);
}

/**
 * Alterna entre modo claro e escuro e salva a escolha.
 * Chamada pelos botões de tema no HTML.
 */
function alternarTema() {
  const estaEscuro = document.documentElement.classList.contains('dark');
  const novoTema   = estaEscuro ? 'claro' : 'escuro';
  localStorage.setItem('tema', novoTema);
  aplicarTema(!estaEscuro);
  atualizarTextoTema(!estaEscuro);
}

/**
 * Atualiza o texto dos botões que alternam o tema.
 * @param {boolean} escuro - true se o tema atual é escuro
 */
function atualizarTextoTema(escuro) {
  document.querySelectorAll('[data-tema-label]').forEach(function(el) {
    el.textContent = escuro ? 'Modo Claro' : 'Modo Escuro';
  });
}

// Aplica o tema IMEDIATAMENTE (evita piscada branca ao carregar)
// Obs: este trecho também está no <head> do base.html para rodar antes do body
(function() {
  var salvo   = localStorage.getItem('tema');
  var prefere = window.matchMedia('(prefers-color-scheme: dark)').matches;
  aplicarTema(salvo === 'escuro' || (!salvo && prefere));
})();


/* -------------------------------------------------------------
   2. SIDEBAR MOBILE
   Abre e fecha o menu lateral em telas pequenas.
   ------------------------------------------------------------- */

/**
 * Abre a sidebar no mobile.
 */
function abrirSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.add('aberta');
  if (overlay) overlay.classList.add('visivel');
  document.body.style.overflow = 'hidden'; // trava o scroll de fundo
}

/**
 * Fecha a sidebar no mobile.
 */
function fecharSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.remove('aberta');
  if (overlay) overlay.classList.remove('visivel');
  document.body.style.overflow = '';
}

// Fecha a sidebar ao pressionar ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') fecharSidebar();
});


/* -------------------------------------------------------------
   3. FLASH MESSAGES
   Remove as notificações automaticamente após 5 segundos.
   ------------------------------------------------------------- */
function iniciarRemocaoFlash() {
  var mensagens = document.querySelectorAll('.flash');
  if (!mensagens.length) return;

  setTimeout(function() {
    mensagens.forEach(function(el) {
      el.style.transition = 'opacity .5s';
      el.style.opacity = '0';
      setTimeout(function() { el.remove(); }, 500);
    });
  }, 5000); // 5 segundos
}


/* -------------------------------------------------------------
   4. CONTADOR DE CARACTERES
   Mostra quantos caracteres foram digitados em um textarea.
   ------------------------------------------------------------- */

/**
 * Atualiza o contador de caracteres de um textarea.
 * @param {HTMLElement} textarea - O campo de texto
 * @param {string}      idContador - ID do elemento que exibe o número
 * @param {number}      limite - Máximo de caracteres permitidos
 */
function contarCaracteres(textarea, idContador, limite) {
  limite = limite || 500;
  if (textarea.value.length > limite) {
    textarea.value = textarea.value.substring(0, limite);
  }
  var contador = document.getElementById(idContador);
  if (contador) {
    contador.textContent = textarea.value.length;
  }
}


/* -------------------------------------------------------------
   5. SELETOR DE TIPO DE ATENDIMENTO
   Destaca o botão escolhido e sugere um texto inicial.
   ------------------------------------------------------------- */

// Prefixos sugeridos por tipo de solicitação
var PREFIXOS = {
  'Troca':      'Gostaria de realizar a troca de: ',
  'Devolução':  'Solicito devolução de: ',
  'Defeito':    'Produto com defeito: ',
  'Dúvida':     'Tenho uma dúvida sobre: ',
  'Entrega':    'Problema com entrega: ',
  'Outro':      '',
};

/**
 * Seleciona um tipo de atendimento visualmente
 * e sugere texto no campo de descrição.
 * @param {string} tipo - Nome do tipo selecionado
 */
function selecionarTipo(tipo) {
  // Atualiza visual dos botões
  document.querySelectorAll('.tipo-btn').forEach(function(btn) {
    btn.classList.toggle('selecionado', btn.dataset.tipo === tipo);
  });

  // Salva no campo oculto
  var oculto = document.getElementById('tipoSelecionado');
  if (oculto) oculto.value = tipo;

  // Sugere texto no campo descrição (só se estiver vazio)
  var descricao = document.getElementById('descricao');
  if (descricao && !descricao.value.trim()) {
    var prefixo = PREFIXOS[tipo] || '';
    descricao.value = prefixo;
    descricao.focus();
    descricao.setSelectionRange(descricao.value.length, descricao.value.length);
  }
}


/* -------------------------------------------------------------
   6. VALIDAÇÃO DO FORMULÁRIO
   Verifica campos antes de enviar para o servidor.
   ------------------------------------------------------------- */

/**
 * Valida o formulário de novo atendimento.
 * @param {Event} evento - Evento de submit do formulário
 */
function validarFormAtendimento(evento) {
  var descricao = document.getElementById('descricao');
  if (!descricao) return;

  var texto = descricao.value.trim();
  if (texto.length < 10) {
    evento.preventDefault(); // Cancela o envio
    descricao.focus();
    mostrarErroValidacao(descricao, 'Descreva sua solicitação com pelo menos 10 caracteres.');
    return;
  }
  limparErroValidacao(descricao);
}

/**
 * Exibe uma mensagem de erro abaixo de um campo.
 * @param {HTMLElement} campo   - O campo com erro
 * @param {string}      mensagem - Texto do erro
 */
function mostrarErroValidacao(campo, mensagem) {
  limparErroValidacao(campo);
  campo.style.borderColor = 'var(--erro-txt)';
  var msg  = document.createElement('span');
  msg.className = 'erro-validacao';
  msg.style.cssText = 'color: var(--erro-txt); font-size: 12px; margin-top: 4px; display: block;';
  msg.textContent   = mensagem;
  campo.parentNode.insertBefore(msg, campo.nextSibling);
}

/**
 * Remove a mensagem de erro de um campo.
 * @param {HTMLElement} campo - O campo
 */
function limparErroValidacao(campo) {
  campo.style.borderColor = '';
  var anterior = campo.nextSibling;
  if (anterior && anterior.className === 'erro-validacao') {
    anterior.remove();
  }
}


/* -------------------------------------------------------------
   7. CONFIRMAÇÃO DE EXCLUSÃO
   Pede confirmação antes de excluir um registro.
   ------------------------------------------------------------- */

/**
 * Exibe uma caixa de confirmação antes de submeter o form.
 * @param {Event}  evento    - Evento de submit
 * @param {string} mensagem  - Texto da pergunta de confirmação
 */
function confirmarExclusao(evento, mensagem) {
  if (!confirm(mensagem || 'Tem certeza que deseja excluir?')) {
    evento.preventDefault(); // Cancela se o usuário clicar "Cancelar"
  }
}


/* -------------------------------------------------------------
   8. INICIALIZAÇÃO
   Conecta os eventos após o HTML estar pronto.
   ------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {

  // Inicia remoção automática das flash messages
  iniciarRemocaoFlash();

  // Aplica texto correto nos botões de tema
  var escuroAtual = document.documentElement.classList.contains('dark');
  atualizarTextoTema(escuroAtual);

  // Vincula validação ao formulário de atendimento
  var formAtendimento = document.getElementById('formAtendimento');
  if (formAtendimento) {
    formAtendimento.addEventListener('submit', validarFormAtendimento);
  }

  // Vincula confirmação de exclusão nos formulários marcados
  document.querySelectorAll('form[data-confirmar]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      confirmarExclusao(e, form.dataset.confirmar);
    });
  });

});
