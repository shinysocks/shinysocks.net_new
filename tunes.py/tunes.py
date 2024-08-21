import sys
import mpv
import curses  # TODO
import requests


def get_query():
    arguments = sys.argv
    query = ""
    for i in range(1, len(arguments) - 1):
        query += (arguments[i] + "|")

    if len(arguments) > 1:
        query += arguments[len(arguments) - 1]

    return query


def get_url():
    url = "https://shinysocks.net/t"
    try:
        res = requests.head('https://shinysocks.net/t')
        if (not res.ok):
            exit(res.status_code)
    except (requests.exceptions.ConnectionError):
        print("host is down")
        exit(112)

    return url + get_query()


URL = get_url()


player = mpv.MPV(
    video=False,
    terminal=True,
    input_terminal=True,
    really_quiet=True,
)


@player.property_observer('metadata')
def get_meta(_name, data):
    try:
        if data is not None:
            song = data["title"].lower()
            artist = data["artist"].lower()
            album = data["album"].lower()
            print("playing", song, "by", artist, "from", album, "for", end=" ")
    except KeyError:
        print("playing unknown for", end=" ")


@player.property_observer('duration')
def time_observer(_name, value):
    if value is not None:
        remaining_seconds = ((value / 60) - int(value / 60)) * 60
        print(f'{int(value / 60)} minutes & {int(remaining_seconds)} seconds')


@player.on_key_press('q')
def my_q_binding():
    player.quit(0)


@player.on_key_press('ENTER')
def my_enter_binding():
    player.seek(-0.001, reference="absolute")


@player.on_key_press('SPACE')
def my_space_binding():
    player.pause = not player.pause


def exit(code):
    player.terminate()
    sys.exit(code)


def tunes():
    try:
        while True:
            get_url()  # is host still up?
            player.play(URL)
            player.wait_for_playback()

    except (KeyboardInterrupt, mpv.ShutdownError):
        exit(0)
    except (SystemError, RuntimeWarning):
        print("something went wrong")
        exit(120)


if __name__ == "__main__":
    tunes()
