onload = () => {
    // canvasエレメントを取得
    let c = document.getElementById('canvas');
    c.width = 570;
    c.height = 570;
    let tn;
    const sleepByPromise = (sec = 0) =>  {
        return new Promise(resolve => setTimeout(resolve, sec*1000));
    }
    const rand = (min,max) => {
        return Math.floor(Math.random() * max) + min;
    }
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
            default:
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

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

    }
    const ex = (object,object_2) =>  {
        for(let k in object) {
            let copy;
            typeof object[k] !== 'object' ? copy = object[k] : copy = JSON.parse(JSON.stringify(object[k]));
            copy !== undefined && (object_2[k] = copy);
        }
    }
    const move = (obj,dis,dir) => {
        obj.x += Math.cos(dir/180*Math.PI)*dis;
        obj.y += Math.sin(dir/180*Math.PI)*dis;
    }
    const rad = (di) => {
            return di/180*Math.PI;
    }
    const bulletAdd =  (obj,obj2) => {
        n++;
        obj[n] = obj2;
    }
    const distance = (x1,y1,x2,y2) => {
        return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2) )
    }
    let bty = 0;
    const condition = (ch,obj,exData) => {
        switch(ch) {
            default:
            return Math.abs(exData.x) > 1.4 || Math.abs(exData.y) > 1.4;
            break;
            case 1:
            return exData.count > obj.interval;
            break;
            case 2:
            return Math.abs(obj.x - exData.x) < 5 || Math.abs(obj.y - exData.y) < 5;
            break;
            case 3:
            return distance(exData.x,exData.y,obj.x,obj.y) < obj.r;
            break;
            case 4:
            return distance(exData.x,exData.y,obj.x,obj.y) > obj.r;
            break;
            case 5:
            return exData.Is_adr && address[`${exData.parent}-${exData.bNum}`]['re']
        }
    }
    const elementUpdate = (obj,ex) => {
      const element = ['count','rota','x','y','color','size','st_dir','type','shotter','parent','bNum','edir_sp','speed','acc','type','hirahira','chCo','func','address','parent','bNum'];
      const element_def = {'count':10,'rota':36,'x':ex['x'],'y':ex['y'],'color':ex['color'],'st_dir':ex.dir,'size':ex.size,'bNum':ex.count,'parent':`${ex.label}-${ex.index}`,'addeess':null};
      let re = {};
      for(let t of element) {
        obj[t] === undefined ? re[t] = element_def[t] : re[t] = obj[t];
      }
      return re;
    }
    const Add_count = (shot_obj) => {
      let direc = shot_obj['st_dir'];
      for(i = 0; i < shot_obj['count']; i++) {
          shot_obj['dir'] = direc;
          direc += shot_obj['rota'];
          bulletAdd(bullet_obj,JSON.parse(JSON.stringify(shot_obj)))
      }
    }
    const addProcessing = async (obj,ex,sec) => {
        //if(sec != 0 ) await sleepByPromise(sec);
        let shot_obj = elementUpdate(obj,ex);
        if(shot_obj['address'] != null) {

            shot_obj['Is_adr'] = true;
            ex['address'] = `${shot_obj['parent']}-${shot_obj['bNum']}`;
            address[`${shot_obj['parent']}-${shot_obj['bNum']}`] = {re:false,'cond':shot_obj['address']};
        }
        Add_count(shot_obj);
    }
    const shot_cond = (obj,exData,type) => {
        switch(type) {
            default:
            return exData['count'] % obj['interval'] == 0;
            break;
        }
    }
    class Player {
        constructor(array) {
            this.array = array;
        }
        input(obj) {
            window.onkeydown = e => {
                obj[e.keyCode] = true;
            };
            window.onkeyup = e => {
                obj[e.keyCode] = false;
            };
        }
        move(obj,input){
            obj.dX = (obj.speed-input[16]*obj.speed/obj.slow)*(input[39] - input[37]);
            obj.dY = (obj.speed-input[16]*obj.speed/obj.slow)*(input[38] - input[40]);
            obj.x += obj.dX;
            obj.y += obj.dY;
            if(obj.x > 1.2) obj.x = 1.2;
            if(obj.x < -1.2) obj.x = -1.2;
            if(obj.y > 1.2) obj.y = 1.2;
            if(obj.y < -1.2) obj.y = -1.2;
        }
        drawing(obj) {
            set_attribute(vbo_obj[0],attLocation, attStride);
            m.identity(mMatrix);
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniform1f(uniLocation[1],obj.size*0.01);
            gl.uniform2fv(uniLocation[2], [obj.x,obj.y]);
            gl.uniform1f(uniLocation[3], 0.0);
            gl.uniform1i(uniLocation[4], 0);
            gl.uniform4fv(uniLocation[5], [1.0,0.0,0.0,1.0]);
            gl.drawArrays(gl.TRIANGLES, 0, position[0].length/2);
            gl.uniform1f(uniLocation[1], obj.size*0.007);
            gl.uniform4fv(uniLocation[5], [1.0,1.0,1.0,0.0]);
            gl.drawArrays(gl.TRIANGLES, 0, position[0].length/2);
        }
        main(){
            this.input(input);
            this.move(this.array,input);
            this.drawing(this.array);
            console.log(this.array.x.toFixed(2),this.array.y.toFixed(2),morton((this.array.x+1.2)*570,(this.array.y+1.2)*570,570,8));
        }

    }
    class drawAll {
        constructor(array,def,element) {
            this.array = array;
            this.def = def;
            this.element = element;
        }
        move (obj,dis,dir) {
            obj.x += Math.cos(dir/180*Math.PI)*dis;
            obj.y += Math.sin(dir/180*Math.PI)*dis;
        }
        loop(obj) {
            for(let value of Object.keys(this.array)) {
              this.processing(value,obj);
            }

            for(let value of delete_) {
              delete this.array[value];
            }
            for(let value of Object.keys(address)) {

              this.address_processing(value,address);
            }
        }
        address_processing(value,address) {

          let obj = address[value];
          let ret = () => {
            switch(obj['cond']['type']) {
              default:
              obj['cond']['count']--;
              return obj['cond']['count'];
              break;
              case 1:
              return exData.Is_adr && address[`${exData.parent}-${exData.bNum}`]['re']
              break;
            }
          }
          obj['re'] = ret;
        }
        processing(value,exData) {
            exData = JSON.parse(JSON.stringify(this.def));
            ex(this.array[value],exData);
            set_attribute(vbo_obj[exData.type],attLocation, attStride);

            /*if(bty != exData.type) {
                set_attribute(vbo_obj[exData.type],attLocation, attStride);
            }*/
            exData.index = value;
            tn = exData.tn;
            m.identity(mMatrix);
            exData.speed += exData.acc;
            exData.dir += exData.dir_sp;
            exData.edir+=exData.edir_sp;
            exData.count++;
            this.move(exData,exData.speed*0.01,exData.dir);
            m.rotate(mMatrix,exData.count*exData.hirahira,[exData.x,exData.y,0.0],mMatrix);
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniform1f(uniLocation[1], exData.size*0.01);
            gl.uniform2fv(uniLocation[2], [exData.x,exData.y]);
            gl.uniform1f(uniLocation[3], exData.edir*0.03);
            gl.uniform1i(uniLocation[4], exData.type);
            gl.uniform4fv(uniLocation[5], exData.color);
            this.drawing(exData);
            typeof exData.func !== 'undefined' && exData.func();
            if(exData['shotter'] != null) {
                if(shot_cond(exData['shotter'],exData,exData['shotter']['type']) ){
                    this.add(exData['shotter']['info'],exData,exData['shotter']['func'])
                }
            }

            if( condition(exData['chCo'][tn]['cond'],exData['chCo'][tn],exData) ) {
                let element_obj = ['dir','dir_sp','edir','edir_sp','speed','acc','size','color','shotter'];

                for(let v of element_obj) {
                  if(exData['chCo'][tn][v] !== undefined ) exData[v] = exData['chCo'][tn][v];

                }
                exData['chCo'][tn+1] === undefined || this.delete_cond() ? delete_.push(value) : tn++;
            }
            bty = exData.type;
            exData.tn=tn;
            this.array[value] = JSON.parse(JSON.stringify(exData));
        }
        drawing(exData) {
        }
        delete_cond() {
            return false;
        }
        special() {
        }
        add(obj = [{}],exData,func = null) {
            for(let v of obj) {
              if(v['option'] == undefined) v['option'] = {baseCount:1,acc:0,dir_sp:0};
              let ret = v;
              for(let i = 0; i < ret['option']['baseCount']; i++) {
                  func != null ? func(ret,exData,v.sec) : addProcessing(ret,exData,ret.sec);
                  ret['acc'] += ret['option']['acc'];
                  ret['dir_sp'] += ret['option']['dir_sp'];

              }
            }
        }
    }
    class bulletdraw extends drawAll {
        drawing(exData) {
            if(exData.type == 1 || exData.type == 2) {
                gl.drawArrays(gl.TRIANGLES, 0, position[exData.type].length/2);
            } else if(exData.type == 0 || exData.type == 3){
                gl.drawArrays(gl.TRIANGLES, 0, position[exData.type].length/2);
                gl.uniform1f(uniLocation[1], exData.size*0.007);
                gl.uniform4fv(uniLocation[5], [1.0,1.0,1.0,0.0]);
                gl.drawArrays(gl.TRIANGLES, 0, position[exData.type].length/2);
            } else if(exData.type == 4){
                gl.uniform1f(uniLocation[3], rad(exData.dir));
                gl.drawArrays(gl.TRIANGLE_FAN, 0, position[exData.type].length/2);
                m.translate(mMatrix,[0,0,0.1],mMatrix)
                m.multiply(tmpMatrix, mMatrix, mvpMatrix);
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
                gl.uniform1f(uniLocation[1], exData.size*0.009);
                gl.uniform4fv(uniLocation[5], [1.0,1.0,1.0,0.0]);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, position[exData.type].length/2);
            } else if(exData.type == 5){
                gl.uniform1f(uniLocation[3], rad(exData.dir));
                gl.drawArrays(gl.TRIANGLE_FAN, 0, position[exData.type].length/2);
                m.translate(mMatrix,[Math.cos((exData.dir)/180*Math.PI)*( (Math.floor(exData.dir/90) % 2 == 1) - (Math.floor(exData.dir/90) % 2 == 0) ) *0.01,Math.sin((exData.dir)/180*Math.PI)*( (Math.floor(exData.dir/90) % 2 == 0) - (Math.floor(exData.dir/90) % 2 == 1) ) *0.01,0],mMatrix)
                m.multiply(tmpMatrix, mMatrix, mvpMatrix);
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
                gl.uniform1f(uniLocation[1], exData.size*0.009);
                gl.uniform4fv(uniLocation[5], [1.0,1.0,1.0,0.0]);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, position[exData.type].length/2);
            }
        }
    }
    // webglコンテキストを取得
    let gl = c.getContext('webgl') || c.getContext('experimental-webgl');

    // 頂点シェーダとフラグメントシェーダの生成
    let v_shader = create_shader('vs');
    let f_shader = create_shader('fs');

    // プログラムオブジェクトの生成とリンク
    let prg = create_program(v_shader, f_shader);
    let attLocation = new Array();
    let attStride = new Array(2);

    /// 頂点属性を格納する配列

    let position = [];
    let color = [];
    const vbo_func = [
        (obj1,obj2) => {
            /*
            for(let i = 0; i < 10; i++) {
                obj1.push(Math.cos(Math.PI/180*i*36),Math.sin(Math.PI/180*i*36));
                obj2.push(0.0,0.0,0.0,1.0);
            }
            */
            let angle = 10;     // 角度
            let countup = 0;
            for(let i = 0; i<6*10; i+=2){
                countup++;
                // 3点目ならカウントアップ
                if(countup == 3){
                    angle += 36;
                    countup = 0;
                }
                if(i == 0 || i % 6 == 0){
                    obj1.push(0.0,0.0);
                    obj2.push(0.0,0.0,0.0,1.0);
                }else{
                    obj1.push(Math.cos(Math.PI / 180 * angle),Math.sin(Math.PI / 180 * angle));
                    obj2.push(0.0,0.0,0.0,1.0);
                }
            }

        },
        (obj1,obj2) => {
            for(i = 0; i <  18; i++) {
                obj1.push(Math.cos(Math.PI/180*i*20),Math.sin(Math.PI/180*i*20));
                obj2.push(0.5,0.0,0.3,0.5);

                obj1.push(0,0);
                obj2.push(0.0,0.0,0.0,0.0);
            }
        },
        (obj1,obj2) => {
            for(i = 0; i < 36; i++) {
                obj1.push(Math.cos(Math.PI/180*i*10),Math.sin(Math.PI/180*i*10));
                obj2.push(0.0,0.5,0.8,0.5);

                obj1.push(0,0);
                obj2.push(0.0,0.0,0.0,0.0);
            }
        },
        (obj1,obj2) => {
            for(i = 18; i < 54; i++) {
                obj1.push(Math.cos(Math.PI/180*i*10) ,Math.sin(Math.PI/180*i*2.5));
                obj2.push(0.0,0.5,0.8,0.5);
            }
            for(i = 72; i < 108; i++) {
                obj1.push(Math.cos(Math.PI/180*i*2.5) ,Math.sin(Math.PI/180*i*2.5));
                obj2.push(0.0,0.5,0.8,0.5);
            }
        },
        (obj1,obj2) => {
            for(i = 18; i < 54; i++) {
                obj1.push(Math.cos(Math.PI/180*i*2.5) ,Math.sin(Math.PI/180*i*2.5))-1.5;
                obj2.push(1.0,0.0,0.0,1.0);
            }
            for(i = 90; i < 126; i++) {
                obj1.push(Math.cos(Math.PI/180*i*2.5) ,Math.sin(Math.PI/180*i*2.5)+1.5);
                obj2.push(0.0,0.0,0.8,1.0);
            }
        },
        (obj1,obj2) => {
            for(i = 18; i < 54; i++) {
                obj1.push(Math.cos(Math.PI/180*i*2.5) ,Math.sin(Math.PI/180*i*2.5))-1.5;
                obj2.push(1.0,0.0,0.0,1.0);
            }
            for(i = 90; i < 126; i++) {
                obj1.push(Math.cos(Math.PI/180*i*2.5) ,Math.sin(Math.PI/180*i*2.5)+1.5);
                obj2.push(0.0,0.0,0.8,1.0);
            }
        }
    ];
    vbo_func.forEach((v,i) => {
        position[i] = [];
        color[i] = [];
        v(position[i],color[i])
    });

    // VBOの生成
    vbo_obj = [];
    attStride[0] = 2;
    attStride[1] = 4;
    attLocation[0] = gl.getAttribLocation(prg, 'pos');
    attLocation[1] = gl.getAttribLocation(prg, 'col');
    position.forEach((v,i) => {
        vbo_obj[i] = [];
        vbo_obj[i][0] = create_vbo(position[i]);
        vbo_obj[i][1] = create_vbo(color[i]);
    })
    // uniformLocationの取得
    let uniLocation = new Array();
    uniLocation[0]  = gl.getUniformLocation(prg, 'mvpMatrix');
    uniLocation[1]  = gl.getUniformLocation(prg, 'size');
    uniLocation[2]  = gl.getUniformLocation(prg, 'xy_data');
    uniLocation[3]  = gl.getUniformLocation(prg, 'edir');
    uniLocation[4]  = gl.getUniformLocation(prg, 'type');
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

    let bullet_obj = {};
    let address = {};
    let player = {x:0,y:0,dX:0,dY:0,speed:0.018,slow:2.5,size:5};
    let e = 0;
    let d = 0;
    let n = 0;
    /*
    for(i = 0; i < 10; i++) {
        n++;
        bullet_obj[n] = ({dir:i*36,acc:0.004,speed:0.5,size:4,color:[0.2,0.0,0.2,0.0],edir_sp:1,type:0,chCo:[{cond:1,interval:100,speed:0},{cond:0}]})
    }*/

    setInterval(() => {
        e++;
        for(i = 0; i < 10; i++) {
            n++;
            bullet_obj[n] = ({shotter:{interval:200,info:[{
            option:{baseCount:3,acc:0.01,dir_sp:0.01},

              //chCo:[{cond:5,acc:0.1},{cond:0}],
              address:{'type':0,'count':400},count:3,rota:120,acc:0.0,type:5,size:8,st_dir:rand(0,360),}]
             }
              ,chCo:[{cond:1,interval:100,speed:0,color:[0.0,0.0,0.0,-0.2],dir_ac:0.1},{cond:0}] ,
              x:Math.cos(n*0.01)*0.4,
              y:Math.sin(n*0.01)*0.4,
              dir:e*10 + i*36,acc:0.01,speed:0.1,size:5,type:1,edir_sp:1,color:[0,0.4,0,0]})
        }
    } ,650);

/*
    setInterval(() => {
        d-=10;
        for(i = 0; i < 10; i++) {
            n++;
            bullet_obj[n] = ({x:Math.sin(n*0.03)*0.4,y:Math.cos(n*0.03)*0.4,dir:d + i*-36,acc:0.01,speed:0,type:2,dir_ap:1,edir_sp:1})
        }
    } ,500);
    /*
    setInterval(() => {
        for(i = 0; i < 10; i++) {
            n++;
            bullet_obj[n] = ({shotter:{interval:150,info:[{count:2,rota:180}] },dir:e*10 + i*36,acc:0.004,speed:3,acc:-0.1,size:4,color:[0.2,0.0,0.2,0.0],edir_sp:1,type:0,chCo:[{cond:4,x:0,y:0,r:0.4,acc:0.01},{cond:0}] })
        }
    } ,1000);*/

    setInterval(() => {
        e++;
        for(i = 0; i < 10; i++) {
            bulletAdd({shotter:{interval:100,info:{} }});
        }
    } ,150);

    let count = 0;
    let delete_ = [];
    let exData;
    let input_key = [16,37,38,39,40,88,90];
    let input = {};
    input_key.forEach((v,i,arr) => {
        input[v] = false;
    })

    // 恒常ループ
    const playerClass = new Player(player);
    let bulletClass = new bulletdraw(bullet_obj, {
        dir_sp:0,
        edir:0,
        edir_sp:0,
        x:0,
        y:0,
        speed:1,
        acc:0,
        size:5,
        type:0,
        color:[0.0,0.0,0.0,0.0],
        count:0,
        tn:0,
        hirahira:0,
        chCo:[{cond:0}],
        func: () => {
        },
        shotter:null,
        label:'bullet',
        Is_adr:false
    },
    ['count','rota','x','y','color','size','st_dir','type','shotter','parent','bNum','edir_sp','speed','acc','type','hirahira','chCo','func']);
    const all = () => {
        //console.log(Object.keys(bullet_obj).length);
        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        playerClass.main();
        bulletClass.loop(exData);
        delete_ = [];
        // コンテキストの再描画
        gl.flush();
        //console.log(player.x,player.y)
    }
    (function animloop(){
        all();
        requestAnimationFrame(animloop);
    })();

};
