const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('toughts', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
})


try {
  sequelize.authenticate()
  console.log('Conexão efetuada com sucesso!')
} catch (error) {
  console.log(`Erro de conexão: ${error}`)
}

module.exports = sequelize;