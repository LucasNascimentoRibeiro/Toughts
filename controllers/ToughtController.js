const Tought = require('../models/Tought')
const User = require('../models/User')

// Use query operations
const { Op } = require('sequelize') 

module.exports = class ToughtController {
  static async showToughts(req, res){

    let search = ""

    // Verify if a search has been made
    if(req.query.search) {
      search = req.query.search
    }

    let order = 'DESC'

    if(req.query.order === "old") {
      order = 'ASC'
    }else {
      order = 'DESC'
    }

    const toughtsData = await Tought.findAll({
      include: User,
      where: {
        title: { [Op.like]: `%${search}%`},
      },
      order: [['CreatedAt', order]],
    })

    let toughtsQty = toughtsData.length

    if(toughtsQty === 0) {
      toughtsQty = false
    }

    const toughts = toughtsData.map((result) => result.get({plain: true}))

    res.render('toughts/home', {toughts, search, toughtsQty})
  }

  static async dashboard(req, res){

    const userId = req.session.userid
    let emptyToughts = false

    const user = await User.findOne({
      where: {
        id: userId
      },
      include: Tought,
      plain: true,
    })

    if (!userId) {
      res.redirect('/')
    }

    // Filter toughts
    const toughts = user.Toughts.map((result) => result.dataValues)

    if(toughts.length === 0) {
      emptyToughts = true
    }

    res.render('toughts/dashboard', {toughts, emptyToughts})
  }

  static createTought(req, res){
    res.render('toughts/create')
  }

  static async createToughtSave(req, res){
    
    const tought = {
      title: req.body.title,
      UserId: req.session.userid,
    }

    try {
      await Tought.create(tought)

      req.flash('message', 'Pensamento criado!')

      req.session.save(() => {
        res.redirect('/toughts/dashboard')
      }) 

    } catch (error) {
      console.log(`Erro de criação de Pensamento: ${error}`)      
    }
  }

  static async deleteTought(req, res) {
    const id = req.body.id
    const userId = req.session.userid


    try{
      await Tought.destroy({where: {id: id, UserId: userId}})

      req.flash('message', 'Pensamento deletado')


      req.session.save(() => {
        res.redirect('/toughts/dashboard')
      })
    }catch(error){
      console.log(`Erro de remoção: ${error}`)
    }
  }

  static async updateTought(req, res) {
    const id = req.params.id
    const userId = req.session.userid

    const tought = await Tought.findOne({where: {id: id, UserId: userId}, raw: true})

    res.render('toughts/edit', {tought})
  }

  static async updateToughtSave(req, res) {
    const id = req.body.id

    const toughtObject = {
      title: req.body.title,
    }

    try{
      await Tought.update(toughtObject, {where: {id: id}})

      req.flash('message', 'Pensamento Editado!')


      req.session.save(() => {
        res.redirect('/toughts/dashboard')
      })
    }catch(error){
      console.log(`Erro de remoção: ${error}`)
    }
  }

}