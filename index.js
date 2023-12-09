const express = require('express')
const server = express()
const router = express.Router()
const cors = require('cors');
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore()

server.use(express.json({ extended: true }))

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,PATCH,PUT,POST,DELETE");
	res.header("Access-Control-Allow-Headers", "*");
	server.use(cors());
	next();
})

server.use(router)


router.put('/atualizaRegistros', (request, response) => {
	var idCollection = '*******'
	const docRegistros = db.collection('registros').doc(idCollection);
	const dadosAtualizados = request.body

	docRegistros.set(dadosAtualizados)
	.then(() => {
		response.status(200).json({ status: 'Documento atualizado com sucesso' });
	})
	.catch((error) => {
		response.status(500).json({ error: `Falha na requisicao. Erro ${error}` });
	});
});


router.put('/atualizaConfigs', (request, response) => {
	var idCollection = '*******'
	const docConfigs = db.collection('configsMicro').doc(idCollection);
	const dadosAtualizados = request.body

	docConfigs.set(dadosAtualizados, { merge: true })
	.then(() => {

		docConfigs.get()
		.then((docConf) => {
			if (docConf.exists) {
				response.status(200).json(docConf.data());
			} else {
				response.status(400).json({ erro: 'Colleção inexistente' });
			}
		})
		.catch((error) => {
			response.status(500).json({ error: `Falha na requisicao. Erro ${error}` });
		});

	})
	.catch((error) => {
		response.status(500).json({ error: `Falha na requisicao. Erro ${error}` });
	});
});


router.get('/reservatorio', (request, response) => {
	var idCollection = '*******'
	const docConfigs = db.collection('configsMicro').doc(idCollection);
	docConfigs.get()
	.then((docConf) => {
		if (docConf.exists) {
			response.status(200).json(docConf.data());
		} else {
			response.status(400).json({ erro: 'Colleção inexistente' });
		}
	})
	.catch((error) => {
		response.status(500).json({ error: `Falha na requisicao. Erro ${error}` });
	});
});


router.patch('/atualizaSinalRegistros', (request, response) => {
	var idCollection = '*******'
	const docSinal = db.collection('configsMicro').doc(idCollection);
	const { registrosMicroAtualizado } = request.body

	docSinal.update({registrosMicroAtualizado: registrosMicroAtualizado })
	.then(() => {
		response.status(200).json({ status: 'Sinal dos registros atualizado com sucesso' });
	})
	.catch((error) => {
		response.status(500).json({ error: `Falha na requisicao. Erro ${error}` });
	});
});




router.get('/verificaRegistros', (request, response) => {
	var idCollection = '*******'
	var idCollection2 = '*******'
	const docConfigs = db.collection('configsMicro').doc(idCollection);
	const docRegistros = db.collection('registros').doc(idCollection2);

	docConfigs.get()
	.then((docConf) => {
		if (docConf.exists) {
			const atualizado = docConf.data()['registrosMicroAtualizado'];

			if(!atualizado){
				docRegistros.get()
				.then((docReg) => {
					if (docReg.exists) {
						const data = docReg.data();
						response.status(200).json(data);
					} else {
						response.status(404).json({ erro: 'Documento inexistente' });
					}
				})
			}else{
				response.status(204).json({});
			}
		} else {
			response.status(400).json({ erro: 'Colleção inexistente' });
		}
	})
	.catch((error) => {
		const endpoint = request.originalUrl;
		response.status(500).json({ erro: `Falha ao processar a requisição ${endpoint}. Erro: ${error}` });
	});
});


server.listen(3000, () => {
	console.log('Rodando Servidor')
})