// Middleware to check if user is authenticated
module.exports.checkAuth = (req, res, next) => {
  const user = req.session.userid

  if (!user) {
    res.redirect('/login')
    return
  }

  next()
}