export function index(req, res){
  res.sendFile('public/index.html', {root: __dirname+'/../'});
};
