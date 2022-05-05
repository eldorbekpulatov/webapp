from flask import Flask
from flask import url_for
from markupsafe import escape
from flask import render_template


app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route("/tictactoe/", methods=['GET'])
def tictactoe():
    return render_template('tictactoe.html')


@app.route("/triangulation/", methods=['GET'])
def triangulation():
    return render_template('triangulation.html')


@app.route("/sorts/", methods=['GET'])
def sorts():
    return render_template('sorts.html')

@app.route("/heatmap/", methods=['GET'])
def heatmap():
    return render_template('heatmap.html')




if __name__ == '__main__':
    app.run(debug=True, use_debugger=True, use_reloader=True, host="localhost", port=3000)
    
