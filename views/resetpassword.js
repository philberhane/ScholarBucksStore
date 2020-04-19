<html>
	<head>
		<title>ScholarBucks App</title>
		<link rel = "stylesheet" type = "text/css" href = "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css"/>
		<link rel = "stylesheet" type = "text/css" href = "./stylesheets/app.css"/>
		</head>
 <body>
		<div class="ui raised very padded text container segment">
				<h1>Reset Password</h1>
		<div class="ui placeholder segment">
  <div class="ui two column very relaxed stackable grid">
    <div class="column">
      <div class="ui form">
		  <form action="/login" method="POST">
        <div class="field">
          <label>Username</label>
          <div class="ui left icon input">
			   
            <input type="text" name="username" placeholder="Username">
            <i class="user icon"></i>
          </div>
        </div>
        <div class="field">
          <label>Password</label>
          <div class="ui left icon input">
              <input type="password" name="password" placeholder="password">
            <i class="lock icon"></i>
          </div>
        </div>
        
			  <button class="ui blue big button" type="submit">Login</button>
		  </form>
		  <p>
			  Click <span style="text-decoration: underline" data-toggle="modal" data-target="#exampleModalLong">here</span> if you forgot your password
		  </p>
      </div>
    </div>
    <div class="middle aligned column">
      <a class="ui big button" href="/register"><i class="signup icon"></i>Sign Up</a>
        
       
      </div>
    </div>
  </div>
  <div class="ui vertical divider">
	  
	  
    Or
  </div>
</div>
			</div>
		
	 </div>
			</body>
		</html> 
		
		
		
		
		
		
