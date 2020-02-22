window.onload = function () {
    var stream = false;
    var video = document.getElementById("video");
    var canvas = document.getElementById("canvas");
    var datadiv = document.getElementById("datadiv");
    var startbutton = document.getElementById('startbutton');
    var width = 320;
    var height = 0; //calculé en fonction de width et de la hauteur de la vidéo

    //requete du flux vidéo
    navigator.mediaDevices.getUserMedia({
            video: {facingMode: "environment"},
            audio: false
        })
        .then(function (stream) {
            // lorsque le flux vidéo est arrivé
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err) {
            // si une erreur s'est produite
            datadiv.innerText = "Une erreur s'est produite : " + err;
        });

    /**
    il y a un temps d'attente entre le moment
    ou le flux vidéo est validé est le moment ou la première image arrive
    Pour ne pas bloquer la page on detecte l'evenement
    */
    video.addEventListener('canplay', function (ev) {
        // la vidéo s'est lancé, la première fois que sa arrive on configure la taille
        if (!stream) {
            height = video.videoHeight / (video.videoWidth / width);

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);
    
    
    // prendre une photo pour detecter le QrCode
    startbutton.addEventListener('click', function (ev) {
        detect();
        ev.preventDefault(); //empeche le click d'etre géré plus qu'une fois
    }, false);

    /*
      Récupération d'une frame venant du flux vidéo
    */
    function detect() {
        var context = canvas.getContext('2d');
        if (width && height) { // verifie s'il y a une image a récuperer
            canvas.width = width;
            canvas.height = height;
            // dessine la vidéo sur le canvas
            context.drawImage(video, 0, 0, width, height);

            //recupere l'image du canvas
            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            //detecte un QRcode
            var code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            if (code) {
                var lien = code.data;
                if (lien.substring(0,7) == 'http://' || lien.substring(0,8) == 'https://' || lien.substring(0,4) == 'www.') {
                    var node = document.createElement('a');
                    node.setAttribute('href',lien);
                    var txt = document.createTextNode(lien);
                    node.appendChild(txt);
                    datadiv.innerText='';
                    datadiv.appendChild(node);
                } else {
                    datadiv.innerText = lien;
                }
            } else {
                datadiv.innerText = "pas de QRcode trouvé";
            }
        } else {

        }
    }
}
