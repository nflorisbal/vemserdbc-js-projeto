class Usuario {
    id;
    tipo;
    nome;
    dataNascimento;
    email;
    senha;
    candidaturas = []; // lista de Candidatura

    constructor(id, tipo, nome, dataNascimento, email, senha) {
        this.id = id;
        this.tipo = tipo;
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.email = email;
        this.senha = senha;
    }
}

// recebe as candidaturas do usuario e a vaga para qual se candidatou
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
    id; //(automático json-server)
    titulo;
    descricao;
    remuneracao; //(salvar no formato: R$ 3.200,50)
    candidatos = []; // lista de Trabalhadores candidatados na vaga

    constructor(id, titulo, descricao, remuneracao) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.remuneracao = remuneracao;
    }
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
