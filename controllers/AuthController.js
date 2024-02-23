const flash = require('express-flash');
const User = require('../models/User')
const bcrypt = require('bcryptjs');

module.exports = class AuthController {
  static login(req, res) {
    res.render('auth/login')
  }

  static async loginPost(req, res) {

    const {email, password} = req.body

    const user = await User.findOne({where: {email: email}})

    // Check if user exists
    if (!user) {
      req.flash('message', 'Usuario não encontrado.')
      res.render('auth/login')

      return
    }

    // Check if password is correct
    const passwordMatch = bcrypt.compareSync(password, user.password)

    if (!passwordMatch) {
      req.flash('message', 'E-mail ou senha incorretos.')
      res.render('auth/login')

      return
    }


    // Initialize session
    try {
      req.session.userid = user.id

      req.session.save(() => {
        res.redirect('/')
      }) 

    } catch (error) {
      console.log(`Erro de login: ${error}`)      
    }

  }

  static register(req, res) {
    res.render('auth/register')
  }

  static async registerPost(req, res) {
    const { name, email, password, confirmpassword } = req.body

    // Check if password is equal
    if (password != confirmpassword) {
      req.flash('message', 'As senhas não condizem, tente novamente!');
      res.render('auth/register')

      return;
    }

    // Check if User exists
    const checkIfUserExists = await User.findOne({where: {email: email}})

    if (checkIfUserExists) {
      req.flash('message', 'O E-mail ja esta cadastrado!')
      res.render('auth/register')

      return
    }

    // Encrypt Password
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    const user = {
      name,
      email,
      password: hashedPassword,
    }

    try {
      const createdUser = await User.create(user)

      // Save the session of user
      req.session.userid = createdUser.id

      req.flash('message', 'Cadastro realizado com sucesso!')

      req.session.save(() => {
        res.redirect('/')
      })


    } catch (error) {
      console.log(`Erro de cadastro de usuário: ${error}`)
    }

  }

  static logout(req, res) {
    req.session.destroy()
    res.redirect('/login')
  }
}