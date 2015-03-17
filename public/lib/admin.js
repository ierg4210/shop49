(function() {
'use strict';

// Reference: https://ierg4210.github.io/web/lectures/04-lecture-HTTPAndClientSideFormHandling.html#31
function serializeFormData(form) {
	return [].map.call(form.elements, function(el) {
		if (el.name && !el.disabled 
				&& (!el.type || el.type.toLowerCase() !== 'checkbox' || el.checked)) {
			if (el.tagName === 'SELECT' && el.hasAttribute('multiple'))
				return [].map.call(el.selectedOptions, function(o) {
					return [el.name, o.value].map(encodeURIComponent).join('=');
				}).join('&');
			return [el.name, el.value].map(encodeURIComponent).join('=');
		}
	}).join('&');
};

function onSubmitHandler(e) {
	// Disable default form submission to prevent page load
	e.preventDefault();

	// Reference: http://visionmedia.github.io/superagent/#post-/%20put%20requests
	superagent
		.post(this.getAttribute('action'))
		.send(serializeFormData(this))
		.end(function (res) {
			if (res.error) {
				if (res.body.inputErrors) {
					res.body.inputErrors.forEach(function(input){
						alert(input.msg);
					});
				}
				return console.error(res.body.inputError || res.error);
			}

			alert('OK');
			// refresh the page with latest results
			location.reload();
		});
}


function onFormSubmitHandler(e) {
	// Disable default form submission to prevent page load
	e.preventDefault();
	var f=new FormData(this);
	var formTHis = this;
// Reference: http://visionmedia.github.io/superagent/#post-/%20put%20requests
	superagent
		.post(this.getAttribute('action'))
		.send(new FormData(this))
		.type(null)
		.end(function (res) {
			if (res.error) {
				if (res.body.inputErrors) {
					res.body.inputErrors.forEach(function(input){
						alert(input.msg);
					});
				}
				return console.error(res.body.inputError || res.error);
			}

			alert('OK');
			// refresh the page with latest results
			location.reload();
		});
}




function onCatEditHandler(e){
		superagent
		.get('/admin/api/cat/'+this.value)
		.end(function (res) {
			if (res.error) {
				if (res.body.inputErrors) {
					res.body.inputErrors.forEach(function(input){
						alert(input.msg);
					});
				}
				return console.error(res.body.inputError || res.error);
			}

			document.getElementById('catEditName').value=res.body.name;
			// refresh the page with latest results
			
		});
}

function onPIdEditHandler(e){
		superagent
		.get('/admin/api/prod/'+this.value)
		.end(function (res) {
			if (res.error) {
				if (res.body.inputErrors) {
					res.body.inputErrors.forEach(function(input){
						alert(input.msg);
					});
				}
				return console.error(res.body.inputError || res.error);
			}
			document.querySelector('#catEditPCatId [value="' + res.body.catid + '"]').selected = true;
			document.getElementById('prodEditName').value=res.body.name;
			document.getElementById('prodEditPrice').value=res.body.price;
			if (res.body.description){
				document.getElementById('prodEditDescription').value=res.body.description;}
			else {
				document.getElementById('prodEditDescription').value="";}
			document.getElementById("prodEditOriImage").src='/images/products/'+res.body.pid;
			// refresh the page with latest results
			
		});
}
document.querySelector('#categoryNewPanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#categoryEditPanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#categoryRemovePanel form').addEventListener('submit', onSubmitHandler);
document.querySelector('#productNewPanel form').addEventListener('submit', onFormSubmitHandler);
document.querySelector('#productEditPanel form').addEventListener('submit', onFormSubmitHandler);
document.querySelector('#productRemovePanel form').addEventListener('submit', onSubmitHandler);
document.getElementById('catEditCatId').addEventListener('change', onCatEditHandler);
document.getElementById('prodEditPId').addEventListener('change', onPIdEditHandler);


})();
