app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === '123') {
    req.session.isAdmin = true; 
    res.redirect('/frotend/js/panelAdmin/adminValidate.html');
  } else {
    res.redirect('/login.html?error=1');
  }
});
