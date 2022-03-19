
const USUARIOS_URL = 'http://localhost:3000/usuarios';
const VAGAS_URL = 'http://localhost:3000/vagas';
const CLASS_LI_VAGA = [ 'd-flex', 'justify-content-between', 'border', 'border-dark', 'rounded', 'p-3', 'w-100' ];


let permissaoUsuario;

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

    constructor(titulo, descricao, remuneracao) {
        // this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.remuneracao = remuneracao;
    }
}

//#region Funções Utilitárias

const adicionarAtributos = (elemento, id, classes) => {
	elemento.setAttribute('id', id);
	if(classes !== undefined) elemento.classList.add(...classes);
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
    const email = document.getElementById('email-input-login');

    try {
        const resolve = await axios.get(USUARIOS_URL);
        
        const usuario = resolve.data.find(e => e.email === email.value);

        if(usuario === undefined)
            alert('E-mail do usuário não localizado.')
        else
            alert(`Senha recuperada!\n\nUsuário: ${usuario.email}\nSenha: ${usuario.senha}`);

    } catch(erro) {
        console.log(`Ocorreu alguma erro durante a recuperação da senha. (${erro})`);
    }
}

const limparCampos = (...campos) => {
	campos.forEach(e => {
        e.value = '';
    })
}

const primeiraLetra = string => {
	array = string.split(' ');

	for (i in array) {
		array[i] = array[i].charAt(0).toUpperCase() + array[i].slice(1);
	}

	return array.join(' ');
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
    if(listaFiltrada && listaFiltrada.length) {
        let dataDigitada = listaFiltrada.join('');
  
        const { length } = dataDigitada;
  
        switch(length) { 
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
  
    let possuiCaracteresEntrePontos = dominioEmailSplit.every( d => d.length > 1 );
  
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
  
    let letras = listaCaracteres.filter( char => char.toLowerCase() !== char.toUpperCase() );
  
    let possuiLetraMaiuscula = letras.some( l => l.toUpperCase() === l ); // "A".toUppercase() === "A"
    let possuiLetraMinuscula = letras.some( l => l.toLowerCase() === l );
  
    let possuiCharEspecial = listaCaracteres.some( char => char.toLowerCase() === char.toUpperCase() && isNaN(parseInt(char)) );
    let possuiNumero = listaCaracteres.some( char => char.toLowerCase() === char.toUpperCase() && !isNaN(parseInt(char)) );
  
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
    // criar validação e mascara do campo
    return true;
}

//#endregion Validação Inputs Vaga

const validarCadastroUsuario = (event) => {
    event.preventDefault();
	let cadastroValido = validarNome() && validarData() && validarEmail() && validarSenha();

	if (cadastroValido) {
		cadastrarUsuario(event);
	}
}

const cadastrarUsuario = (event) => {
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
			console.log(resolve.data);
			irPara('registration', 'login');
		}, (reject) => {
			console.log('Problema encontrado, e agora? => ', reject);
		});

    limparCampos(tipo, nome, dataNascimento, email, senha);
}

const validarCadastroVaga = (event) => {
    event.preventDefault();
	let cadastroValido = validarTitulo() && validarDescricao() && validarRemuneracao();

	if (cadastroValido) {
		cadastrarVaga(event);
	}
}

const cadastrarVaga = (event) => {
    event.preventDefault();

    let titulo = document.getElementById('title-input-registration');
    let descricao = document.getElementById('description-textarea-registration');
    let remuneracao = document.getElementById('remuneration-input-registration');

    const vaga = new Vaga(titulo.value, descricao.value, remuneracao.value);

    /*
    <li id="li-vaga-1" class="d-flex justify-content-between border border-dark rounded p-3 w-100">
                        <span><strong>Vaga: </strong>Dev Jr</span><span><strong>Salário:</strong> R$ 3.000,00</span>
                    </li>
    */

    axios.post(VAGAS_URL, vaga)
		.then((resolve) => {
            console.log(resolve.data);
            
            const ul = document.getElementById('ul-vagas');
            const li = document.createElement('li');
            
            adicionarAtributos(li, `li-vaga-${resolve.id}`, CLASS_LI_VAGA);
            ul.appendChild(li);

            const spanTitulo = document.createElement('span');
            const spanRemuneracao = document.createElement('span');
            spanTitulo.textContent = `Vaga: ${resolve.data.titulo}`;
            spanRemuneracao.textContent = `Remuneração: ${resolve.data.remuneracao}`;
            li.append(spanTitulo, spanRemuneracao);

            alert('Vaga cadastrada com sucesso!');

			irPara('jobs-registration', 'list-jobs');
		}, (reject) => {
			console.log(`Ocorreu alguma erro durante o cadastro da vaga. (${reject})`);
		});
    
    limparCampos(titulo, descricao, remuneracao);
}

const validarLogin = async () => {
    const email = document.getElementById('email-input-login');
	const senha = document.getElementById('password-input-login');
    const erro = document.getElementById('login-error');

    const resolve = await axios.get(USUARIOS_URL);
           
    usuario = resolve.data.find(e => e.email === email.value && e.senha === senha.value);
    
    if (usuario === undefined)
        erro.classList.remove('d-none');
    else {
        limparCampos(email, senha);
        erro.classList.add('d-none');
        permissaoUsuario = resolve.tipo;
        irPara('login', 'list-jobs');
    }
        
}