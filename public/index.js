$( document ).ready(function() {
  var cornerlength = 20;
  var positions = [['top', 'bottom'], ['left', 'right', 'right', 'left']];
  for (let i = 1; i <= 4; i++) {
    let style = `width:${cornerlength}vw; height: ${cornerlength}vw; position: absolute; ${positions[0][i % 2]}: 0; ${positions[1][i-1]}: 0;`;
    $('body').append(`<div class="corner" id="${positions[0][i % 2]}-${positions[1][i-1]}" style="${style}">`);
  }
  
  $('input[type="text"]').on('focus', function() {
    $('#responseMessage').text("");
  });
  
  $('#post-book-form').on('submit', function(e) {
    e.preventDefault();
    $('input[type="submit"]').prop('disabled', true);
    $('button').prop('disabled', true);
    $('body').css('color', 'gray');
    $.ajax({ 
      url: '/books',
      data: $(this).serialize(),
      method: 'POST',
      success: function (data) {
        var msg_el = $('body').append(`<div id="info-message"><p>Successfully uploaded <span>${data.title}</span> with ID:</p><p>${data._id}</p><button type="text" id="ok-btn">OK</button></div>`);
        $('#ok-btn').on('click', function() {
          window.location.reload();
        })
      },
      error: function (res) {
        $('body').css('color', 'black');
        $('input[type="submit"]').prop('disabled', false);
        $('button').prop('disabled', false);
        $('#responseMessage').html(res.responseText);
      }
    })
  })
  
  $('.comment-book-form').on('submit', function(e) {
    $('input[type="submit"]').prop('disabled', true);
    $('button').prop('disabled', true);
    $('body').css('color', 'gray');
  })
  
});