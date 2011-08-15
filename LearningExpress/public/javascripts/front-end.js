var addMessage = function (sMessage) {
  $('#recvMessages').append('<p>' + sMessage + '</p>');
};

var sendMessage = function (sMessage) {
  $.ajax({
    type: 'POST',
    url: '/message',
    data: { message : sMessage }
  });
};

var updateAndPoll = function (sMessage) {
  addMessage(sMessage);
  longPoll();
};

var longPoll = function () {
  $.ajax({
    type: 'GET',
    url: '/messages',
    data: { id : $('#clientId').val() },
    success: updateAndPoll
  });  
};

$(function () {
  $('#sendMesg').click(function () {
    sendMessage($('#message').val());
  });
  addMessage('App Loaded!');
  longPoll();
});