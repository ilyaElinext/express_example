window.onload = (event) => {
  console.log('page is fully loaded');
   timeout = setInterval(() =>{
	  axios.get('https://guarded-reaches-84708.herokuapp.com/version')
	    .then(function (response) {
	      // handle success
	      console.log('call guarded-reaches-84708');
	      const apiVersion = response.data.version;
	      console.log(apiVersion);
	      	  axios.get('http://localhost:4505/reload')
			    .then(function (response) {
			      // handle success
			      console.log('response from http://localhost:4505/reload');
			      console.log(response);
			      location.reload();
			    })
			    .catch(function (error) {
			      // handle error
			      console.log(error);
			    })
			    .then(function () {
			      // always executed
			    });
	    })
	    .catch(function (error) {
	      // handle error
	      console.log(error);
	    })
	    .then(function () {
	      // always executed
	    });
	}, 10*1000)
};