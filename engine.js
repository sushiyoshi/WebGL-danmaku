// sample_005
//
// WebGLでモデル座標変換行列を操作し再帰的にモデルを移動・回転・拡大縮小する

onload = function(){
    // canvasエレメントを取得
    let c = document.getElementById('canvas');
    c.width = 640;
    c.height = 480;
    const create_shader = id => {
        // シェーダを格納する変数
        let shader;

        // HTMLからscriptタグへの参照を取得
        let scriptElement = document.getElementById(id);

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
    const create_program = (vs, fs) => {
        // プログラムオブジェクトの生成
        let program = gl.createProgram();

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
    const create_vbo = data => {
        // バッファオブジェクトの生成
        let vbo = gl.createBuffer();

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
    const set_attribute = (vbo, attL, attS) => {
        // 引数として受け取った配列を処理する
        for(let i in vbo){
            // バッファをバインドする
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

            // attributeLocationを有効にする
            gl.enableVertexAttribArray(attL[i]);

            // attributeLocationを通知し登録する
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
    }
    const ex = (object,object_2) =>  {
        for(let k in object) {
            let copy;
            typeof object[k] !== 'object' ? copy = object[k] : copy = JSON.parse(JSON.stringify(object[k]));
            copy !== undefined && (object_2[k] = copy);
        }
    }
    const rad = (di) => {
            return di/180*Math.PI;
      }
    // webglコンテキストを取得
    let gl = c.getContext('webgl') || c.getContext('experimental-webgl');

    // 頂点シェーダとフラグメントシェーダの生成
    let v_shader = create_shader('vs');
    let f_shader = create_shader('fs');

    // プログラムオブジェクトの生成とリンク
    let prg = create_program(v_shader, f_shader);

    // attributeLocationを配列に取得
    let attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'pos0');
    attLocation[1] = gl.getAttribLocation(prg, 'col0');
    attLocation[2] = gl.getAttribLocation(prg, 'pos1');
    attLocation[3] = gl.getAttribLocation(prg, 'col1');

    // attributeの要素数を配列に格納
    let attStride = new Array(2);
    attStride[0] = 2;
    attStride[1] = 4;
    attStride[2] = 2;
    attStride[3] = 4;

    // 頂点属性を格納する配列
    let position = [];
    let color = [];
    position[0] =[];
    color[0] =[];
    for(let i = 0; i < 36; i++) {
        position[0].push(Math.cos(Math.PI/180*i*10),Math.sin(Math.PI/180*i*10));
        color[0].push(0.0,0.0,0.0,1.0);
    }
    position[1] =[];
    color[1] =[];
    for(let i = 0; i < 18; i++) {
        position[1].push(Math.cos(Math.PI/180*i*20),Math.sin(Math.PI/180*i*20));
        color[1].push(0.5,0.0,0.3,0.5);
        
        position[1].push(0,0);
        color[1].push(0.0,0.0,0.0,0.0);
    }
    // VBOの生成
    let vbo_obj = [];
    position.forEach((v,i) => {
        vbo_obj.push( create_vbo(position[i]) );
        vbo_obj.push( create_vbo(color[i]) );
    })

    // VBO を登録する
    set_attribute(vbo_obj, attLocation, attStride);

    // uniformLocationの取得
    let uniLocation = new Array();
    uniLocation[0]  = gl.getUniformLocation(prg, 'mvpMatrix');
    uniLocation[1]  = gl.getUniformLocation(prg, 'size');
    uniLocation[2]  = gl.getUniformLocation(prg, 'xy_data');
    uniLocation[3]  = gl.getUniformLocation(prg, 'edir');
    uniLocation[4]  = gl.getUniformLocation(prg, 'btype');
    uniLocation[5]  = gl.getUniformLocation(prg, 'color');
    // minMatrix.js を用いた行列関連処理
    // matIVオブジェクトを生成
    let m = new matIV();

    // 各種行列の生成と初期化
    let mMatrix = m.identity(m.create());
    let vMatrix = m.identity(m.create());
    let pMatrix = m.identity(m.create());
    let tmpMatrix = m.identity(m.create());
    let mvpMatrix = m.identity(m.create());

    // ビュー×プロジェクション座標変換行列
    m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);

    let obj = {};
    let e = 0;
    let d = 0;
    let n = 0;
    setInterval(() => {
        e++;
        for(i = 0; i < 10; i++) {
            n++;
            obj[n] = ({dir:e*10 + i*36,acc:0.01,speed:0.1,size:3,btype:1,color:[0.0,0.0,0.0,-0.5]})
        }
    } ,100)

    setInterval(() => {
        d-=10;
        for(i = 0; i < 10; i++) {
            n++;
            obj[n] = ({dir:d + i*-36,acc:0.02,speed:0,btype:1})
        }
    } ,200)
    let count = 0;
    let delete_ = [];
    let exData
    // 恒常ループ
    (function(){

        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        console.log(Object.keys(obj).length)
        Object.keys(obj).forEach((value,index,array) => {
            exData = {
                dir:0,
                edir:0,
                edir_sp:1,
                x:0,
                y:0,
                speed:1,
                acc:0,
                size:5,
                btype:0,
                color:[1.0,0.0,0.0,0.0]
            }
            ex(obj[value],exData);
            m.identity(mMatrix);
            exData.speed += exData.acc;
            exData.edir+=exData.edir_sp;
            exData.x += Math.cos(exData.dir/180*Math.PI)*exData.speed*0.01;
            exData.y += Math.sin(exData.dir/180*Math.PI)*exData.speed*0.01;
            //m.translate(mMatrix,[Math.cos(rad(exData.edir))*Math.sin(rad(exData.edir))*size*-1,Math.sin(rad(exData.edir))*Math.cos(rad(exData.edir)),0],mMatrix);
            //m.rotate(mMatrix, exData.edir*0.01, [exData.x+Math.cos(rad(exData.edir)), exData.y-Math.sin(rad(exData.edir)), 0], mMatrix);
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniform1f(uniLocation[1], exData.size*0.01);
            gl.uniform2fv(uniLocation[2], [exData.x,exData.y]);
            gl.uniform1f(uniLocation[3], exData.edir*0.03);
            gl.uniform1i(uniLocation[4], exData.btype);
            gl.uniform4fv(uniLocation[5], exData.color);
            switch(exData.btype) {
                case 1:
                gl.drawArrays(gl.TRIANGLES, 0, position[exData.btype].length/2);
                break;
                default :
                gl.drawArrays(gl.TRIANGLE_FAN, 0, position[exData.btype].length/2);
                gl.uniform1f(uniLocation[1], exData.size*0.007);
                gl.uniform4fv(uniLocation[5], [1.0,1.0,1.0,0.0]);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, position[exData.btype].length/2);
                break;
            }
            
            if(Math.abs(exData.x) > 3.5 || Math.abs(exData.y) > 2) {
                delete_.push(value);
            }
            obj[value] = JSON.parse(JSON.stringify(exData));
        })
        delete_.forEach((value,index,array) => {
            delete obj[value];
            console.log('delete');
        })
        delete_ = [];
        // コンテキストの再描画
        gl.flush();

        // ループのために再帰呼び出し
        setTimeout(arguments.callee, 10);
    })();

};
