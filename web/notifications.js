if(!"Notification" in window) {
    console.log(`No notification supported`);
}
console.log(`Notification supported. Rock ON`);

Notification.requestPermission().then(function(result) {
  console.log(`Permission ${result}`);
});

var socket = io.connect('http://188.166.155.168:9000');

function buildProductInfo(p) {
    var daysLeft = Math.floor((new Date(p.expirationDate) - new Date()) / (1000 * 3600 * 24));

    switch(daysLeft){
        case 0:  return `${p.name} are expering today!`;
        case 1:  return `${p.name} are expering in 1 day!`;
        default: return `${p.name} are expering in ${daysLeft} days!`;
    }
}

var showNotifcation = function(data) {
    console.log(`showing notification`);

    var title = 'Food About to Expire!';
    var body = data.items.reduce((s,p) => {
         return s += `${buildProductInfo(p)}
`
    },'');
    var icon = 'http://file2.answcdn.com/answ-cld/image/upload/w_100,h_100,c_fill,g_face:center,q_60,f_jpg/v1/tk/view/answ-images/d/7/6/6/9/9/d76699d0/25ae317aeb097a19734189c445b982aa33d6c646.jpg';

    var n = new Notification(title, {
        body,
        icon
    });

    n.addEventListener("show", function() {
        var audio = new Audio("web/sounds/sad.mp3");
        audio.play();
    }, false);

    n.onclick = function(e) {
        window.open('https://chennaitribune.files.wordpress.com/2015/02/indian-beggars.jpg', '_blank');
    }

    setTimeout(n.close.bind(n), 5000);

    return n;
}

// socket.emit('expiring', {userId: 'alberto',
//     items: [{
//         "name": "Mirtilos",
//         "quantity": 2000,
//         "expirationDate": "2016-10-07T20:03:19+00:00",
//         "packageDate": "2016-10-06T20:03:19+00:00"
//       },{
//         "name": "Tomates",
//         "quantity": 2000,
//         "expirationDate": "2016-10-08T20:03:19+00:00",
//         "packageDate": "2016-10-06T20:03:19+00:00"
//       },{
//         "name": "Iogurtes",
//         "quantity": 2000,
//         "expirationDate": "2016-10-08T20:03:19+00:00",
//         "packageDate": "2016-10-06T20:03:19+00:00"
//       }]
// });

socket.on('notification', function (data) {
    console.log(`received notification ${data}`);

    showNotifcation(data);
});
