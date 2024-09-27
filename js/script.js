console.log('working');
//Global variable.
let currentsong = new Audio();
let songs;
let currFolder;

//function for convert seconds into minutes.

function convertSecondsToMinutes(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // Calculate minutes and remaining seconds
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds to be always 2 digits
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// // Example usage:
// console.log(convertSecondsToMinutes(12));   // Output: 00:12
// console.log(convertSecondsToMinutes(75));   // Output: 01:15


async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }

    //show all the song in playlist.
    let SongUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    SongUL.innerHTML = "";
    for (const song of songs) {
        SongUL.innerHTML = SongUL.innerHTML + `<li>  <img src="./img/music.svg" alt="music">
                           <div class="info">
                               <div>${song.replaceAll("%20", " ")}</div>
                               <div>Chill Out.</div>
                           </div>
   
                           <div class="playnow">
                               <span>Play Now</span>
                               <img src="./img/play.svg" alt="play">
                           </div> </li>`
    }

    //Attach an event listener to each song.

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML);

        })
    })

    return songs;

}

const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play();
        play.src = "./img/pause.svg";
    }



    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/")[4];
            //Get the meta data of folder.
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}"  class="card">
                        <div class="circle">
                            <svg viewBox="0 0 24 24" width="20" height="20" color="#000000" fill="none">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="pic">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`


        }
    }

    //Load the folder whenever card is clicked.
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
        })
    })

}

async function main() {

    //get the list of all the songs. 
    await getsongs("songs/ncs");
    playmusic(songs[0], true)

    //Display all the albums on the page.
    displayAlbums();


    // Add eventlistener to play btn.
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "./img/pause.svg";
        }

        else {
            currentsong.pause();
            play.src = "./img/play.svg";
        }
    })

    //Add eventlistener to previous btn.

    previous.addEventListener("click", () => {
        console.log('previous was clicked');
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);

        }
    })

    //Add eventlistener to next btn.
    next.addEventListener("click", () => {
        currentsong.pause();
        console.log('next was clicked');
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);

        }

        console.log(songs, index);

    })

    // listen for timeupdate 

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}/${convertSecondsToMinutes(currentsong.duration)}`;
        document.querySelector(".seekbar-circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + '%';
    })


    // Add eventlistener to seekbar.
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".seekbar-circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;

    })

    //Add an eventlistner to hamburger.

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Add an event listener to close .
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add eventlistener to volume.
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if(currentsong.volume > 0)
        {
            document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("mute.svg", "volume.svg");
        }
        
    })

    //Add ewventlistener on volume to mute the track
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 0.15;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })






}

main();
