// sample_005
//
// WebGLでモデル座標変換行列を操作し再帰的にモデルを移動・回転・拡大縮小する

onload = function(){
    // canvasエレメントを取得
    var c = document.getElementById('canvas');
    c.width = 640;
    c.height = 480;
    const ex = (object,object_2) =>  {
        for(let k in object) {
            let copy;
            typeof object[k] !== 'object' ? copy = object[k] : copy = JSON.parse(JSON.stringify(object[k]));
            copy !== undefined && (object_2[k] = copy);
        }
    }
    // webglコンテキストを取得
    var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');

    // プログラムオブジェクトの生成とリンク
    var prg = create_program(v_shader, f_shader);

    // attributeLocationを配列に取得
    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'color');

    // attributeの要素数を配列に格納
    var attStride = new Array(2);
    attStride[0] = 2;
    attStride[1] = 4;

    // 頂点属性を格納する配列
/*
    var position = [
           1.0, 1.0, 0.0,
           1.0, -1.0, 0.0,
          -1.0, 1.0, 0.0,
          -1.0, 1.0, 0.0,
    ];
    */
    var position = [];
    var color = [];
    for(let i = 0; i < 36; i++) {
        position.push(Math.cos(Math.PI/180*i*10),Math.sin(Math.PI/180*i*10));
        color.push(1.0,0.0,0.0,0.0);
    }

    // VBOの生成
    var pos_vbo = create_vbo(position);
    var col_vbo = create_vbo(color);

    // VBO を登録する
    set_attribute([pos_vbo, col_vbo], attLocation, attStride);

    // uniformLocationの取得
    var uniLocation = new Array();
    uniLocation[0]  = gl.getUniformLocation(prg, 'mvpMatrix');
    uniLocation[1]  = gl.getUniformLocation(prg, 'size');
    uniLocation[2]  = gl.getUniformLocation(prg, 'xy_data');

    // minMatrix.js を用いた行列関連処理
    // matIVオブジェクトを生成
    var m = new matIV();

    // 各種行列の生成と初期化
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var tmpMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());

    // ビュー×プロジェクション座標変換行列
    m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);

    // カウンタの宣言
    var obj = {};
    var c = 0;
    var d = 0;
    var n = 0;
    for(i = 0; i < 1; i++) {
        n++;
        obj[n] = ({dir:0,acc:0.01,speed:0.01})
    }
    setInterval(() => {
        c++;
        for(i = 0; i < 10; i++) {
            n++;
            obj[n] = ({dir:c*10 + i*36,acc:0.01,speed:0.1,size:3})
        }
    } ,100)

    setInterval(() => {
        d+=10;
        for(i = 0; i < 10; i++) {
            n++;
            obj[n] = ({dir:d + i*-36,acc:0.1,speed:0})
        }
    } ,100)
    var count = 0;
    var delete_ = [];
    let exData
    let xy_data;
    let size;
    let vertex;
    // 恒常ループ
    (function(){

        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        Object.keys(obj).forEach((value,index,array) => {
            exData = {
                dir:0,
                x:0,
                y:0,
                speed:1,
                acc:0,
                size:5
            }
            ex(obj[value],exData);
            m.identity(mMatrix);
            exData.speed += exData.acc;
            //m.translate(obj[value].mMatrix, [Math.cos(obj[value].dir/180*Math.PI)*obj[value].speed*0.01,Math.sin(obj[value].dir/180*Math.PI)*obj[value].speed*0.01,0.0], obj[value].mMatrix);
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            exData.x += Math.cos(exData.dir/180*Math.PI)*exData.speed*0.01;
            exData.y += Math.sin(exData.dir/180*Math.PI)*exData.speed*0.01;
            xy_data = [exData.x,exData.y];
            size = exData.size*0.01;
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniform1f(uniLocation[1], size);
            gl.uniform2fv(uniLocation[2], xy_data);

            gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length/2);
            /*
            if(Math.abs(obj[value].mMatrix[12]) > 4.2 || Math.abs(obj[value].mMatrix[13]) > 2.5) {
                delete_.push(value);
            }*/
            obj[value] = JSON.parse(JSON.stringify(exData));
        })
        delete_.forEach((value,index,array) => {
            delete obj[value];
            //console.log('delete');
        })
        // コンテキストの再描画
        gl.flush();

        // ループのために再帰呼び出し
        setTimeout(arguments.callee, 10);
    })();

    // シェーダを生成する関数
    function create_shader(id){
        // シェーダを格納する変数
        var shader;

        // HTMLからscriptタグへの参照を取得
        var scriptElement = document.getElementById(id);

        // scriptタグが存在しない場合は抜ける
        if(!scriptElement){return;}

        // scriptタグのtype属性をチェック
        switch(scriptElement.type){

            // 頂点シェーダの場合
            case 'x-shader/x-vertex':
                shader = gl.createShader(gl.VERTEX_SHADER);
                break;

            // フラグメントシェーダの場合
            case 'x-shader/x-fragment':
                shader = gl.createShader(gl.FRAGMENT_SHADER);
                break;
            default :
                return;
        }

        // 生成されたシェーダにソースを割り当てる
        gl.shaderSource(shader, scriptElement.text);

        // シェーダをコンパイルする
        gl.compileShader(shader);

        // シェーダが正しくコンパイルされたかチェック
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){

            // 成功していたらシェーダを返して終了
            return shader;
        }else{

            // 失敗していたらエラーログをアラートする
            alert(gl.getShaderInfoLog(shader));
        }
    }

    // プログラムオブジェクトを生成しシェーダをリンクする関数
    function create_program(vs, fs){
        // プログラムオブジェクトの生成
        var program = gl.createProgram();

        // プログラムオブジェクトにシェーダを割り当てる
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);

        // シェーダをリンク
        gl.linkProgram(program);

        // シェーダのリンクが正しく行なわれたかチェック
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){

            // 成功していたらプログラムオブジェクトを有効にする
            gl.useProgram(program);

            // プログラムオブジェクトを返して終了
            return program;
        }else{

            // 失敗していたらエラーログをアラートする
            alert(gl.getProgramInfoLog(program));
        }
    }

    // VBOを生成する関数
    function create_vbo(data){
        // バッファオブジェクトの生成
        var vbo = gl.createBuffer();

        // バッファをバインドする
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

        // バッファにデータをセット
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);

        // バッファのバインドを無効化
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // 生成した VBO を返して終了
        return vbo;
    }

    // VBOをバインドし登録する関数
    function set_attribute(vbo, attL, attS){
        // 引数として受け取った配列を処理する
        for(var i in vbo){
            console.log(attL[i]);
            // バッファをバインドする
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

            // attributeLocationを有効にする
            gl.enableVertexAttribArray(attL[i]);

            // attributeLocationを通知し登録する
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
    }

};
