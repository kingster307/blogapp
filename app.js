const express = require('express'),
	  app = express(),
	  bodyParser = require('body-parser'),
	  mongoose = require('mongoose'),
	  methodOverride = require('method-override'),
	  expressSanitizer = require('express-sanitizer');

let url = process.env.DATABASEURL || "mongodb://localhost/restful_blog_app";

// app config
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
mongoose.connect(url,{ useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
app.use(methodOverride("_method")); //telling app to look for _method in URL --> _method basically the variable that the library is using for logic & control routing / telling it to treat request as variable specifies

// mongoose/model config
const blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now},
}), 
	 Blog = mongoose.model('Blog', blogSchema); 



// RESTful routes 

app.get('/', (req,res)=>{
		res.redirect('/blogs');
});
// INDEX route
app.get("/blogs", (req,res)=>{
	Blog.find({}, (err, blogs)=>{
		if(err){
			console.log(`error: ${err}`);
		}else{
			res.render('index', {blogs: blogs});	
		} 
	});
});

//NEW ROUTE
app.get("/blogs/new", (req,res) =>{
	res.render("new");
});

// CREATE route
app.post('/blogs', (req,res)=>{
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// create blogs
	Blog.create(req.body.blog, (err, newBlog)=>{
		if(err){
			console.log(`error: ${err}`);
			res.render('new');
		}else{
			res.redirect('/blogs');
		}
	});
});

//SHOW ROUTE
app.get('/blogs/:id', (req,res)=>{
	Blog.findById(req.params.id, (err,foundBlog)=>{
		if(err){
			console.log(`Error: ${err}`);
			res.redirect('/blogs');
		}else{
			res.render('shows', {blog: foundBlog});
		}
	});
});

// EDIT ROUTE 
app.get('/blogs/:id/edit', (req,res)=>{
	Blog.findById(req.params.id, (err,foundBlog)=>{
		if(err){
			console.log(`Error: ${err}`);
			res.redirect('/blogs');
		}else{
			res.render("edit", {blog: foundBlog});
		}
	});
	// res.render('edit');
});


// UPDATE ROUTE
app.put('/blogs/:id', (req,res)=>{
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog,(err, updatedBlog)=>{
		if(err){
			res.redirect('/blogs');
		}else{
			res.redirect(`/blogs/${req.params.id}`);
		}
	});
});


//DESTROY ROUTE
app.delete("/blogs/:id", (req,res)=>{
	// res.send('destroy route');
	Blog.findByIdAndRemove(req.params.id, (err)=>{
		if(err){
			console.log(`Error: ${err}`);
			res.redirect('/blogs');
		}else{
			res.redirect('/blogs');
		}
	});
});


app.listen(process.env.PORT || 2468, ( )=>{
	console.log('server on');
});