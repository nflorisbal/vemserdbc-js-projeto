
// constantes globais
const USUARIOS_URL = 'http://localhost:3000/usuarios';
const VAGAS_URL = 'http://localhost:3000/vagas';
const CLASS_LI_VAGA = ['d-flex', 'justify-content-between', 'border', 'border-dark', 'rounded', 'p-3', 'w-100', 'mb-3'];
const CLASS_DIV_VAGA = ['w-100', 'p-3', 'd-flex', 'flex-column', 'border', 'border-dark', 'rounded', 'mt-4', 'align-content-center'];

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
        // this.id = id;
        this.tipo = tipo;
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.email = email;
        this.senha = senha;
    }
}

class Candidatura {
    // recebe as candidaturas do usuario e a vaga para qual se candidatou
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
    remuneracao; //(salvar no formato: R$ 3.200,50)
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

const esqueceuSenha = async () => {
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

// const apagarComponentes = (elemento) => {
//     const componente = document.getElementById(elemento);
//     componente.remove();
// }

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
    // const botaoExcluirVaga = document.getElementById('btn-remove-job');

    switch (permissao) {
        case '1':
            botaoSairCadastroVagas.classList.add('btn-dark');
            botoesCadastroVagas.classList.remove('justify-content-between');
            botoesCadastroVagas.classList.add('justify-content-center');
            document.getElementById('add-job-btn').classList.add('d-none');
            document.getElementById('btn-remove-job').classList.add('d-none');
            break;
        case '2':
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
    // debugger;
    // const remuneracaoInserida = document.getElementById('remuneration-input-registration');
    // const remuneracaoReal = remuneracaoInserida.value;

    // mascaraRemuneracao(remuneracaoInserida, remuneracaoReal);

    // const remuneracaoSplit = [...remuneracaoReal];
    // const validTamanho = remuneracaoSplit.length >= 5;
    // const validMaiorzero = Math.max.apply(null, remuneracaoSplit);
    // const valid = validTamanho && validMaiorzero;

    // // para setar o texto de erro em vermelho
    // let erroRemuneracao = document.getElementById('remuneration-registration-error');
    // erroRemuneracao.setAttribute('class', valid ? 'd-none' : 'text-danger');

    return true;
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
            // case 3: case 4:
            //     input.value = `R$ ${listaDigitada.substring(0, 2)},${listaDigitada.substring(2, 5)}`;
            //     break;
            // default:
            //     input.value = `R$ ${listaDigitada.substring(0, 2)},${listaDigitada.substring(2, 5)}.${listaDigitada.substring(6, 9)}`;
        }
    }
}

//#endregion Validação Inputs Vaga

const validarLogin = () => {
        
    const email = document.getElementById('email-input-login');
    const senha = document.getElementById('password-input-login');
    const erro = document.getElementById('login-error');

    axios.get(USUARIOS_URL).then(resolve => {
        usuarioLogado = resolve.data.find(e => e.email === email.value && e.senha === senha.value);

        if (usuarioLogado === undefined)
            erro.classList.remove('d-none');
        else {
            limparCampos(email, senha);
            erro.classList.add('d-none');
            
            permissoesUsuario(usuarioLogado.tipo);
            buscarVagas();
        }
    }, reject => {
        console.log(`Ocorreu alguma erro durante o login. (${reject})`);
    });
}

const validarCadastroUsuario = event => {
    event.preventDefault();
    let cadastroValido = validarNome() && validarData() && validarEmail() && validarSenha();

    if (cadastroValido) {
        cadastrarUsuario(event);
    }
}

const cadastrarUsuario = event => {
    event.preventDefault();

    let tipo = document.getElementById('lista-tipo-usuario');
    let nome = document.getElementById('nome-input-registration');
    let dataNascimento = document.getElementById('date-input-registration');
    let email = document.getElementById('email-input-registration');
    let senha = document.getElementById('password-input-registration');

    nome.value = primeiraLetra(nome.value);

    const usuario = new Usuario(tipo.value, nome.value, dataNascimento.value, email.value, senha.value);

    axios.post(USUARIOS_URL, usuario)
        .then((resolve) => {
            alert('Cadastro realizado com sucesso!')
            irPara('registration', 'login');
        }, (reject) => {
            console.log(`Ocorreu algum erro durante o cadastro do usuário. (${reject})`);
        });

    limparCampos(tipo, nome, dataNascimento, email, senha);
}

const validarCadastroVaga = event => {
    let cadastroValido = validarTitulo() && validarDescricao() && validarRemuneracao();

    if (cadastroValido) {
        cadastrarVaga(event);
    }
}

const cadastrarVaga = event => {
    event.preventDefault();

    let titulo = document.getElementById('title-input-registration');
    let descricao = document.getElementById('description-textarea-registration');
    let remuneracao = document.getElementById('remuneration-input-registration');

    const vaga = new Vaga(undefined, titulo.value, descricao.value, remuneracao.value);

    axios.post(VAGAS_URL, vaga)
        .then((resolve) => {
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
        }, (reject) => {
            console.log(`Ocorreu algum erro durante o cadastro da vaga. (${reject})`);
        });

    limparCampos(titulo, descricao, remuneracao);
}

const buscarVagas = async () => {  
    irPara('login', 'list-jobs');

    const ul = document.getElementById('ul-vagas');
    if(ul!== null) ul.remove();
    
    await axios.get(VAGAS_URL).then(resolve => {
        const div = document.getElementById('div-vagas');
        const ul = document.createElement('ul');
        ul.setAttribute('id', 'ul-vagas');
        div.appendChild(ul);

        resolve.data.forEach(e => {
            const li = document.createElement('li');
            adicionarAtributos(li, `li-vaga-${e.id}`, CLASS_LI_VAGA);
            li.addEventListener('click', detalharVaga); 
            const spanTitulo = document.createElement('span');
            const spanRemuneracao = document.createElement('span');
            spanTitulo.textContent = `Vaga: ${e.titulo}`;
            spanRemuneracao.textContent = `Remuneração: ${e.remuneracao}`;
            ul.appendChild(li);
            li.append(spanTitulo, spanRemuneracao);         
        });
    }, reject => {
        console.log(`Ocorreu alguma erro a busca das vagas. (${reject})`);
    });
}

const detalharVaga = async event => {
    irPara('list-jobs', 'jobs-details');

    const id = event.target.id;
    const idSplit = id.split('-');
    const idElemento = idSplit[idSplit.length - 1];

    const div = document.getElementById('jobs-content-position');
    while(div.firstChild) div.removeChild(div.firstChild);

    await axios.get(`${VAGAS_URL}/${idElemento}`).then(resolve => {       
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
        trocarFuncionalidadeBotoes();
    }, reject => {
        console.log(`Ocorreu algum erro ao detalhar a vaga. (${reject})`);
    });
}

const excluirVaga = async () => {
    if (confirm(`Deseja remover a vaga ${vagaSelecionada.titulo}?`)) {
        await axios.delete(`${VAGAS_URL}/${vagaSelecionada.id}`).then(resolve => {
            const li = document.getElementById(`li-vaga-${vagaSelecionada.id}`);
            li.remove();
            irPara('jobs-details', 'list-jobs');
        }, reject => {
            console.log(`Ocorreu algum erro ao excluir a vaga. (${reject})`);
        });
    }
}

const candidatarVaga = () => {   
    let candidatura =  new Candidatura(vagaSelecionada.id, usuarioLogado.id);
   
    usuarioLogado.candidaturas.push(candidatura);
    vagaSelecionada.candidatos.push(candidatura);

    axios.put(`${USUARIOS_URL}/${usuarioLogado.id}`, usuarioLogado).then(resolve => {
        console.log(resolve.data);
    }, reject => {
        console.log(`Ocorreu algum erro ao candidatar-se a vaga. (${reject})`);
    });

    axios.put(`${VAGAS_URL}/${vagaSelecionada.id}`, vagaSelecionada).then(resolve => {
        console.log(resolve.data);
    }, reject => {
        console.log(`Ocorreu algum erro ao registrar o candidato a vaga. (${reject})`);
    });

    alert(`Candidatura realizada com sucesso!`);

    // trocarFuncionalidadeBotoes();
}

const removerCandidatura = () => {
    // debugger;



    usuarioLogado.candidaturas = usuarioLogado.candidaturas.filter(e => e.idVaga !== vagaSelecionada);
    vagaSelecionada.candidatos = vagaSelecionada.candidatos.filter(e => e.idCandidato !== usuarioLogado);
    console.log(usuarioLogado.candidaturas);
    console.log(vagaSelecionada.candidatos);
  
    axios.put(`${USUARIOS_URL}/${usuarioLogado.id}`, usuarioLogado).then(resolve => {
        console.log(resolve.data);
    }, reject => {
        console.log(`Ocorreu algum erro ao remover a candidatura. (${reject})`);
    });

    axios.put(`${VAGAS_URL}/${vagaSelecionada.id}`, vagaSelecionada).then(resolve => {
        console.log(resolve.data);
    }, reject => {
        console.log(`Ocorreu algum erro ao remover o candidato a vaga. (${reject})`);
    });

    alert(`Candidatura cancelada com sucesso!`);
    console.log('remover candidatura');
}

const trocarFuncionalidadeBotoes = () => {
    const divBtns = document.getElementById('jobs-details-btns');
    divBtns.removeChild(divBtns.lastChild);
    const btnCandidatar = document.createElement('button');
    adicionarAtributos(btnCandidatar, 'btn-apply-job', ['btn', 'btn-dark']);
    divBtns.appendChild(btnCandidatar);
    if(vagaSelecionada.candidatos.some(e => e.idCandidato === usuarioLogado.id)) {
        btnCandidatar.textContent = 'Cancelar Candidatura';
        btnCandidatar.addEventListener('click', removerCandidatura);
    } else {
        btnCandidatar.textContent = 'Candidatar-se';
        btnCandidatar.addEventListener('click', candidatarVaga);
    }
}