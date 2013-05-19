  
  socket.on('message', function(message) {
      console.log("message received from %s: it says %s", message.id, message.text);
      //if (message.origin != player.id)
         alert(message.text);
  });
  
  
  socket.on('load', function(data)
  {
     var x = 0;
     var showedX, showedO = false;
     console.log(data);
     while( x < data.length )
     {
       if(data[x].mark == 'x')
       {
         $("#p1").html(data[x].name + ": <span style='color:red'>X</span>");
         showedX = true;
       }
       else if(data[x].mark == 'o')
       {
         $("#p2").html(data[x].name + ": <span style='color:blue'>O</span>");
         showedO = true;
       }
       x++;
     }
     
     if(!showedX) $("#p1").html("Waiting...");
     if(!showedO) $("#p2").html("Waiting...");
     
     if(showedX && showedO) startGame = true;
     
  });
  
  socket.on('connect_1', function(data){
    player.id = data.id;
    player.name = data.name;
  });