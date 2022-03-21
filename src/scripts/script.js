// constantes globais
const USUARIOS_URL = 'http://localhost:3000/usuarios';
const VAGAS_URL = 'http://localhost:3000/vagas';
const CLASS_LI_VAGA = ['d-flex', 'justify-content-between', 'border', 'border-dark', 'rounded', 'p-3', 'w-100', 'mb-3'];
const CLASS_DIV_VAGA = ['w-100', 'p-3', 'd-flex', 'flex-column', 'border', 'border-dark', 'rounded', 'mt-4', 'align-content-center'];
const CLASS_DIV_CANDIDATO = ['row', 'd-flex', 'justify-content-between', 'w-100', 'border-bottom', 'border-dark', 'pb-2', 'pt-2', 'align-items-center'];
const CLASS_DIV_CANDIDATOS = ['border', 'border-dark', 'border-bottom-0', 'w-75', 'text-center', 'justify-content-between', 'd-flex', 'flex-column', 'align-items-center', 'mb-2']

// variáveis globais
let permissaoUsuario;
let vagaSelecionada;
let usuarioLogado;

class Usuario {
    id;
    tipo;
    nome;
    dataNascimento;
    email;
    senha;
    candidaturas = [];

    constructor(tipo, nome, dataNascimento, email, senha) {
        this.tipo = tipo;
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.email = email;
        this.senha = senha;
    }
}

class Candidatura {
    idVaga;
    idCandidato;
    reprovado = false;

    constructor(idVaga, idCandidato) {
        this.idVaga = idVaga;
        this.idCandidato = idCandidato;
    }
}

class Vaga {
    id;
    titulo;
    descricao;
    remuneracao;
    candidatos = [];

    constructor(id, titulo, descricao, remuneracao) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.remuneracao = remuneracao;
    }
}

//#region Funções Utilitárias
const adicionarAtributos = (elemento, id, classes) => {
    elemento.setAttribute('id', id);
    if (classes !== undefined) elemento.classList.add(...classes);
}

const alternarClasses = (elemento, ...classes) => {
    classes.forEach(classe => {
        elemento.classList.toggle(classe);
    });
}

const irPara = (origem, destino) => {
    const elementoOrigem = document.getElementById(origem);
    const elementoDestino = document.getElementById(destino);

    alternarClasses(elementoOrigem, 'd-none', 'd-flex');
    alternarClasses(elementoDestino, 'd-none', 'd-flex');
}

const recuperarSenha = async () => {
    const email = prompt('Digite o e-mail para recuperar a senha:');

    if (email === null) return;

    try {
        const resolve = await axios.get(USUARIOS_URL);
        const usuario = resolve.data.find(e => e.email === email);

        if (usuario === undefined)
            alert('E-mail do usuário não localizado.')
        else
            alert(`Senha recuperada!\n\nUsuário: ${usuario.email}\nSenha: ${usuario.senha}`);

    } catch (erro) {
        console.log(`Ocorreu algum erro durante a recuperação da senha. (${erro})`);
    }
}

const limparCampos = (...campos) => {
    campos.forEach(e => {
        e.value = '';
    })
}

const voltarCadastro = () => {
    document.getElementById('lista-tipo-usuario').value = '1';
    document.getElementById('nome-input-registration').value = '';
    document.getElementById('date-input-registration').value = '';
    document.getElementById('email-input-registration').value = '';
    document.getElementById('password-input-registration').value = '';

    irPara('registration', 'login')
}

const primeiraLetra = string => {
    array = string.split(' ');

    for (i in array) {
        array[i] = array[i].charAt(0).toUpperCase() + array[i].slice(1);
    }

    return array.join(' ');
}

const permissoesUsuario = permissao => {
    const botoesCadastroVagas = document.getElementById('job-btns');
    const botaoSairCadastroVagas = document.getElementById('exit-btn');
    const funcionalidadeReprovar = document.getElementsByClassName('btn-fail');
    const colunaDataCandidatos = document.getElementsByClassName('text-data');

    switch (permissao) {
        case '1':
            for (componente of funcionalidadeReprovar) componente.classList.add('d-none');
            for (componente of colunaDataCandidatos) componente.classList.add('text-end');
            botaoSairCadastroVagas.classList.add('btn-dark');
            botoesCadastroVagas.classList.remove('justify-content-between');
            botoesCadastroVagas.classList.add('justify-content-center');
            document.getElementById('add-job-btn').classList.add('d-none');
            document.getElementById('btn-remove-job').classList.add('d-none');
            break;
        case '2':
            for (componente of funcionalidadeReprovar) componente.classList.remove('d-none');
            for (componente of colunaDataCandidatos) componente.classList.remove('text-end');
            botaoSairCadastroVagas.classList.remove('btn-dark');
            botoesCadastroVagas.classList.add('justify-content-between');
            botoesCadastroVagas.classList.remove('justify-content-center');
            document.getElementById('add-job-btn').classList.remove('d-none');
            document.getElementById('btn-remove-job').classList.remove('d-none');
            break;
    }
}
//#endregion Funções Utilitárias

//#region Validação Inputs Usuário

//#region Validação Nome
const validarNome = () => {
    let nomeInput = document.getElementById('nome-input-registration');
    let nome = nomeInput.value;

    let possuiSohLetras = [...nome].every(letra => letra.toLowerCase() !== letra.toUpperCase() || letra == ' ');
    let naoEhVazio = nome !== '';

    let ehValido = possuiSohLetras && naoEhVazio;

    // para setar o texto de erro em vermelho
    let erroNome = document.getElementById('nome-registration-error');
    erroNome.setAttribute('class', ehValido ? 'd-none' : 'text-danger');

    return ehValido;
}
//#endregion Validação Nome

//#region Validação Data
const validarData = () => {
    let inputData = document.getElementById('date-input-registration');
    let dataDigitada = inputData.value;

    adicionarMascaraData(inputData, dataDigitada);

    let dataConvertida = moment(dataDigitada, 'DDMMYYYY');

    let dezoitoAnosAtras = moment().diff(dataConvertida, 'years') >= 18;

    // comparações de data - date1.isBefore(date2)  /  date1.isAfter(date2)  /  date1.isSameOrBefore(date2)  /  date1.isSameOrAfter(date2)
    let dataAnteriorHoje = dataConvertida.isBefore(moment());

    let ehValido = dataConvertida.isValid() && dataAnteriorHoje && dezoitoAnosAtras && dataDigitada.length === 10; // 10/05/2001

    // para setar o texto de erro em vermelho
    let erroData = document.getElementById('date-registration-error');
    erroData.setAttribute('class', ehValido ? 'd-none' : 'text-danger');

    return ehValido;
}

const adicionarMascaraData = (input, data) => {
    let listaCaracteres = [...data];

    let listaFiltrada = listaCaracteres.filter(c => !isNaN(parseInt(c)));
    if (listaFiltrada && listaFiltrada.length) {
        let dataDigitada = listaFiltrada.join('');

        const { length } = dataDigitada;

        switch (length) {
            case 0: case 1: case 2:
                input.value = dataDigitada;
                break;
            case 3: case 4:
                input.value = `${dataDigitada.substring(0, 2)}/${dataDigitada.substring(2, 4)}`;
                break;
            default:
                input.value = `${dataDigitada.substring(0, 2)}/${dataDigitada.substring(2, 4)}/${dataDigitada.substring(4, 8)}`;
        }
    }
}
//#endregion Validação Data

//#region Validação Email
const validarEmail = () => {
    let emailDigitado = document.getElementById('email-input-registration').value;
    let listaCaracteres = emailDigitado.split(''); // [...emailDigitado]

    let emailSplit = emailDigitado.split('@');

    let possuiArroba = emailSplit.length > 1;

    let dominioEmail = possuiArroba ? emailSplit[1] : '';
    let dominioEmailSplit = dominioEmail.split('.');

    let possuiPontosNoDominio = dominioEmailSplit.length > 1;

    let possuiCaracteresEntrePontos = dominioEmailSplit.every(d => d.length > 1);

    let comecaComLetra = listaCaracteres.length ? listaCaracteres[0].toUpperCase() !== listaCaracteres[0].toLowerCase() : false;

    let ehValido = possuiArroba && possuiPontosNoDominio && possuiCaracteresEntrePontos && comecaComLetra;

    // para setar o texto de erro em vermelho
    let erroEmail = document.getElementById('email-registration-error');
    erroEmail.setAttribute('class', ehValido ? 'd-none' : 'text-danger');

    return ehValido;
}
//#endregion Validação Email

//#region Validação Senha
const validarSenha = () => {
    let senhaDigitada = document.getElementById('password-input-registration').value;
    let listaCaracteres = senhaDigitada.split('');

    let letras = listaCaracteres.filter(char => char.toLowerCase() !== char.toUpperCase());

    let possuiLetraMaiuscula = letras.some(l => l.toUpperCase() === l); // "A".toUppercase() === "A"
    let possuiLetraMinuscula = letras.some(l => l.toLowerCase() === l);

    let possuiCharEspecial = listaCaracteres.some(char => char.toLowerCase() === char.toUpperCase() && isNaN(parseInt(char)));
    let possuiNumero = listaCaracteres.some(char => char.toLowerCase() === char.toUpperCase() && !isNaN(parseInt(char)));

    let possuiOitoCaracteres = senhaDigitada.length >= 8;

    let naoPossuiEspacos = !senhaDigitada.includes(' ');

    let ehValido = possuiOitoCaracteres && possuiLetraMaiuscula && possuiLetraMinuscula &&
        possuiCharEspecial && possuiNumero && naoPossuiEspacos;

    // para setar o texto de erro em vermelho
    let erroSenha = document.getElementById('password-registration-error');
    erroSenha.setAttribute('class', ehValido ? 'd-none' : 'text-danger');

    return ehValido;
}
//#endregion Validação Senha

//#endregion #region Validação Inputs Usuário

//#region Validação Inputs Vaga
const validarTitulo = () => {
    const tituloInput = document.getElementById('title-input-registration');
    const titulo = tituloInput.value;

    const ehValido = titulo !== '';

    // para setar o texto de erro em vermelho
    let erroTitulo = document.getElementById('title-registration-error');
    erroTitulo.setAttribute('class', ehValido ? 'd-none' : 'text-danger');

    return ehValido;
}

const validarDescricao = () => {
    const descricaoTextarea = document.getElementById('description-textarea-registration');
    const descricao = descricaoTextarea.value;

    const ehValido = descricao !== '';

    // para setar o texto de erro em vermelho
    let erroDescricao = document.getElementById('description-registration-error');
    erroDescricao.setAttribute('class', ehValido ? 'd-none' : 'text-danger');

    return ehValido;
}

const validarRemuneracao = () => {
    const remuneracaoInserida = document.getElementById(
        'remuneration-input-registration'
    )
    const remuneracaoReal = remuneracaoInserida.value

    mascaraRemuneracao(remuneracaoInserida, remuneracaoReal)

    const remuneracaoSplit = [...remuneracaoReal]
    const valid = remuneracaoSplit.length >= 7
    // para setar o texto de erro em vermelho
    const erroRemuneracao = document.getElementById(
        'remuneration-registration-error'
    )
    erroRemuneracao.setAttribute('class', valid ? 'd-none' : 'text-danger')

    return valid
}

const mascaraRemuneracao = (input, remuneracao) => {
    let listaRemuneracao = [...remuneracao]

    let listaRemuneracaoFiltrada = listaRemuneracao.filter(
        c => !isNaN(parseInt(c))
    )
    if (listaRemuneracaoFiltrada && listaRemuneracaoFiltrada.length) {
        let listaDigitada = listaRemuneracaoFiltrada.join('')

        const { length } = listaDigitada

        switch (length) {
            case 0:
            case 1:
            case 2:
                input.value = `R$ ${listaDigitada}`
                break
        }
    }
}
//#endregion Validação Inputs Vaga

const validarLogin = async () => {
    const email = document.getElementById('email-input-login');
    const senha = document.getElementById('password-input-login');
    const erro = document.getElementById('login-error');

    try {
        const resolve = await axios.get(USUARIOS_URL);

        usuarioLogado = resolve.data.find(e => e.email === email.value && e.senha === senha.value);

        if (usuarioLogado === undefined)
            erro.classList.remove('d-none');
        else {
            limparCampos(email, senha);
            erro.classList.add('d-none');

            permissoesUsuario(usuarioLogado.tipo);
            buscarVagas();
        }
    } catch (reject) {
        console.log(`Ocorreu alguma erro durante o login. (${reject})`);
    }
}

const validarCadastroUsuario = event => {
    event.preventDefault();
    let cadastroValido = validarNome() && validarData() && validarEmail() && validarSenha();

    if (cadastroValido) {
        cadastrarUsuario(event);
    }
}

const cadastrarUsuario = async event => {
    event.preventDefault();

    let tipo = document.getElementById('lista-tipo-usuario');
    let nome = document.getElementById('nome-input-registration');
    let dataNascimento = document.getElementById('date-input-registration');
    let email = document.getElementById('email-input-registration');
    let senha = document.getElementById('password-input-registration');

    nome.value = primeiraLetra(nome.value);

    const usuario = new Usuario(tipo.value, nome.value, dataNascimento.value, email.value, senha.value);

    try {
        await axios.post(USUARIOS_URL, usuario);
        alert('Cadastro realizado com sucesso!');
        irPara('registration', 'login');
    } catch (reject) {
        console.log(`Ocorreu algum erro durante o cadastro do usuário. (${reject})`);
    }

    limparCampos(tipo, nome, dataNascimento, email, senha);
}

const validarCadastroVaga = event => {
    let cadastroValido = validarTitulo() && validarDescricao() && validarRemuneracao();

    if (cadastroValido) {
        cadastrarVaga(event);
    }
}

const cadastrarVaga = async event => {
    event.preventDefault();

    let titulo = document.getElementById('title-input-registration');
    let descricao = document.getElementById('description-textarea-registration');
    let remuneracao = document.getElementById('remuneration-input-registration');

    const vaga = new Vaga(undefined, titulo.value, descricao.value, remuneracao.value);

    try {
        const resolve = await axios.post(VAGAS_URL, vaga);

        const ul = document.getElementById('ul-vagas');
        const li = document.createElement('li');

        adicionarAtributos(li, `li-vaga-${resolve.data.id}`, CLASS_LI_VAGA);
        ul.appendChild(li);

        const spanTitulo = document.createElement('span');
        const spanRemuneracao = document.createElement('span');
        spanTitulo.textContent = `Vaga: ${resolve.data.titulo}`;
        spanRemuneracao.textContent = `Remuneração: ${resolve.data.remuneracao}`;
        li.append(spanTitulo, spanRemuneracao);
        li.addEventListener('click', detalharVaga);

        alert('Vaga cadastrada com sucesso!');

        irPara('jobs-registration', 'list-jobs');
    } catch (reject) {
        console.log(`Ocorreu algum erro durante o cadastro da vaga. (${reject})`);
    }

    limparCampos(titulo, descricao, remuneracao);
}

const buscarVagas = async () => {
    irPara('login', 'list-jobs');

    const ul = document.getElementById('ul-vagas');
    if (ul !== null) ul.remove();

    try{
        const resolve = await axios.get(VAGAS_URL);

        const div = document.getElementById('div-vagas');
        const ul = document.createElement('ul');
        ul.setAttribute('id', 'ul-vagas');
        div.appendChild(ul);

        resolve.data.forEach(e => {
            const li = document.createElement('li');
            adicionarAtributos(li, `li-vaga-${e.id}`, CLASS_LI_VAGA);
            li.addEventListener('click', detalharVaga);
            const spanTitulo = document.createElement('span');
            spanTitulo.setAttribute('id', `span-titulo-${e.id}`)
            spanTitulo.textContent = `Vaga: ${e.titulo}`;
            const spanRemuneracao = document.createElement('span');
            spanRemuneracao.setAttribute('id', `span-remuneracao-${e.id}`)
            spanRemuneracao.textContent = `Remuneração: ${e.remuneracao}`;
            ul.appendChild(li);
            li.append(spanTitulo, spanRemuneracao);
        });
    } catch (reject) {
        console.log(`Ocorreu alguma erro a busca das vagas. (${reject})`);
    }
}

const detalharVaga = async event => {
    const id = event.target.id;
    const idSplit = id.split('-');
    const idElemento = idSplit[idSplit.length - 1];

    const div = document.getElementById('jobs-content-position');
    while (div.firstChild) div.removeChild(div.firstChild);

    try {
        const resolve = await axios.get(`${VAGAS_URL}/${idElemento}`);

        const divVaga = document.createElement('div');
        adicionarAtributos(divVaga, `jobs-content-details-${resolve.data.id}`, CLASS_DIV_VAGA);
        div.appendChild(divVaga);

        const pTitulo = document.createElement('p');
        const pDescricao = document.createElement('p');
        const pRemuneracao = document.createElement('p');
        pTitulo.textContent = `Titulo: ${resolve.data.titulo}`;
        pDescricao.textContent = `Descrição: ${resolve.data.descricao}`;
        pRemuneracao.textContent = `Remuneração: ${resolve.data.remuneracao}`;
        divVaga.append(pTitulo, pDescricao, pRemuneracao);

        vagaSelecionada = resolve.data;

        buscarCandidatos();

        trocarFuncionalidadeBotoes();
    } catch (reject) {
        console.log(`Ocorreu algum erro ao detalhar a vaga. (${reject})`);
    }

    irPara('list-jobs', 'jobs-details');
}

const excluirVaga = async () => {
    if (confirm(`Deseja remover a vaga ${vagaSelecionada.titulo}?`)) {
        try {
            await axios.delete(`${VAGAS_URL}/${vagaSelecionada.id}`);
            const li = document.getElementById(`li-vaga-${vagaSelecionada.id}`);
            li.remove();
            irPara('jobs-details', 'list-jobs');
        } catch (reject) {
            console.log(`Ocorreu algum erro ao excluir a vaga. (${reject})`);
        }

        try {
            const resolve = await axios.get(USUARIOS_URL);
            resolve.data.forEach(async usuario => {
                let candidaturasSemVagaExcluida = usuario.candidaturas.filter(vaga => vaga.idVaga !== vagaSelecionada.id);
                usuario.candidaturas = candidaturasSemVagaExcluida;

                try {
                    axios.put(`${USUARIOS_URL}/${usuario.id}`, usuario);
                } catch (reject) {
                    console.log(`Ocorreu algum erro ao excluir a vaga do usuario. (${reject})`);
                }
            });
        } catch (reject) {
            console.log(`Ocorreu algum erro ao buscar usuario para excluir a vaga. (${reject})`);
        }
    }
}

const candidatarVaga = async () => {
    let candidatura = new Candidatura(vagaSelecionada.id, usuarioLogado.id);

    usuarioLogado.candidaturas.push(candidatura);
    vagaSelecionada.candidatos.push(candidatura);

    try{
        await axios.put(`${USUARIOS_URL}/${usuarioLogado.id}`, usuarioLogado);
    } catch (reject) {
        console.log(`Ocorreu algum erro ao candidatar-se a vaga. (${reject})`);
    }

    try{
        await axios.put(`${VAGAS_URL}/${vagaSelecionada.id}`, vagaSelecionada);
    } catch (reject) {
        console.log(`Ocorreu algum erro ao registrar o candidato a vaga. (${reject})`);
    }

    alert(`Candidatura realizada com sucesso!`);

    trocarFuncionalidadeBotoes();
    buscarCandidatos(vagaSelecionada.id);
}

const removerCandidatura = async () => {
    usuarioLogado.candidaturas = usuarioLogado.candidaturas.filter(e => e.idVaga !== vagaSelecionada.id);
    vagaSelecionada.candidatos = vagaSelecionada.candidatos.filter(e => e.idCandidato !== usuarioLogado.id);

    try {
        await axios.put(`${USUARIOS_URL}/${usuarioLogado.id}`, usuarioLogado);
    } catch (reject) {
        console.log(`Ocorreu algum erro ao remover a candidatura. (${reject})`);
    }

    try {
        await axios.put(`${VAGAS_URL}/${vagaSelecionada.id}`, vagaSelecionada);
    } catch (reject) {
        console.log(`Ocorreu algum erro ao remover o candidato a vaga. (${reject})`);
    }

    alert(`Candidatura cancelada com sucesso!`);

    buscarCandidatos(vagaSelecionada.id);
    trocarFuncionalidadeBotoes();
}

const reprovarCandidato = async (candidato, vaga) => {
    candidato.candidaturas.map(candidatura => {
        if (candidatura.idVaga === vaga.id) candidatura.reprovado = true;
    });

    try {
        await axios.put(`${USUARIOS_URL}/${candidato.id}`, candidato);

        const btnReprovar = document.getElementById(`btn-reprove-${candidato.id}`);
        btnReprovar.disabled = true;
        btnReprovar.classList.add('btn-secondary');
        btnReprovar.classList.remove('btn-danger');
    } catch (reject) {
        console.log(`Ocorreu algum erro ao atualizar vaga removida das candidaturas. (${reject})`);
    }
}

const buscarCandidatos = async () => {
    const div = document.getElementById('div-candidates');
    if (div !== null) div.remove();

    try {
        const resolve = await axios.get(USUARIOS_URL);

        let candidatos = [];

        resolve.data.forEach(usuario => {
            let candidatosDaVaga = usuario.candidaturas.find(vaga => vaga.idVaga === vagaSelecionada.id);
            if (candidatosDaVaga !== undefined)
                candidatos.push(usuario);
        })

        const divPosicao = document.getElementById('candidates-position');
        const divCandidatos = document.createElement('div');
        adicionarAtributos(divCandidatos, 'div-candidates', CLASS_DIV_CANDIDATOS);
        divPosicao.appendChild(divCandidatos);

        candidatos.forEach(candidato => {
            const divCandidato = document.createElement('div');
            adicionarAtributos(divCandidato, `div-candidate-${candidato.id}`, CLASS_DIV_CANDIDATO);

            const divNome = document.createElement('div');
            const divData = document.createElement('div');
            const divBtn = document.createElement('div');
            const btnReprovar = document.createElement('button');

            adicionarAtributos(divNome, `div-name-${candidato.id}`, ['col', 'text-start']);
            adicionarAtributos(divData, `div-data-${candidato.id}`, ['col', 'text-data']);
            adicionarAtributos(divBtn, `div-btn-${candidato.id}`, ['col', 'text-end', 'btn-fail']);
            adicionarAtributos(btnReprovar, `btn-reprove-${candidato.id}`, ['btn', 'btn-danger']);

            if (candidato.candidaturas.some(candidatura =>
                candidatura.reprovado && candidatura.idVaga === vagaSelecionada.id)) {
                btnReprovar.disabled = true;
                btnReprovar.classList.add('btn-secondary');
                btnReprovar.classList.remove('btn-danger');
            }

            btnReprovar.addEventListener('click', () => reprovarCandidato(candidato, vagaSelecionada));

            divNome.textContent = `${candidato.nome}`;
            divData.textContent = `${candidato.dataNascimento}`;
            btnReprovar.textContent = 'Reprovar';

            divBtn.appendChild(btnReprovar);
            divCandidato.append(divNome, divData, divBtn);
            divCandidatos.appendChild(divCandidato);
        });
    } catch (reject) {
        console.log(`Ocorreu algum erro ao buscar candidatos a vaga. (${reject})`);
    }

    permissoesUsuario(usuarioLogado.tipo);
}

const trocarFuncionalidadeBotoes = () => {
    const divBtns = document.getElementById('jobs-details-btns');
    divBtns.removeChild(divBtns.lastChild);

    const btnCandidatar = document.createElement('button');
    adicionarAtributos(btnCandidatar, 'btn-apply-job', ['btn', 'btn-dark']);
    divBtns.appendChild(btnCandidatar);
    
    let naoPodeCandidatar = usuarioLogado.candidaturas.find(candidatura => candidatura.idVaga === vagaSelecionada.id) 
    
    if(naoPodeCandidatar !== undefined)
        if(naoPodeCandidatar.reprovado) {
            btnCandidatar.disabled = true;
            btnCandidatar.classList.add('btn-secondary');
            btnCandidatar.classList.remove('btn-dark');
        }

    if (vagaSelecionada.candidatos.some(candidato => candidato.idCandidato === usuarioLogado.id)) {
        btnCandidatar.textContent = 'Cancelar Candidatura';
        btnCandidatar.addEventListener('click', removerCandidatura);
    } else if (usuarioLogado.tipo == '1') {
        btnCandidatar.textContent = 'Candidatar-se';
        btnCandidatar.addEventListener('click', candidatarVaga);
    } else {
        btnCandidatar.classList.add('d-none');
    }
}