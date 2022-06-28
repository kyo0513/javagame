"use strict";

//参考元：http://tk2-217-18218.vs.sakura.ne.jp/prog/rpg/

//システム（環境）関連
const	CHRHEIGHT	= 9;					//	キャラの高さ
const	CHRWIDTH	= 8;					//	キャラの幅
const	FONT		= "12px monospace";		//	使用フォント
const	FONTSTYLE	= "#ffffff";			//	文字色
const	HEIGHT		= 128;					//	仮想画面サイズ。高さ(120⇒128へ)
const	WIDTH		= 128;					//	仮想画面サイズ。幅
const   INTERVAL2   = 60;
let     mCurrentStart =0;
let     mCurrentFrame =0;
let		gScreen;							//	仮想画面
let		gFrame = 0;							//	内部カウンタ
let		gHeight;							//	実画面の高さ
let		gWidth;								//	実画面の幅

//MAP関連
const	MAP_HEIGHT	= 32;					//	マップ高さ
const	MAP_WIDTH	= 32;					//	マップ幅
const	SCR_HEIGHT	= 8;					//	画面タイルサイズの半分の高さ
const	SCR_WIDTH	= 8;					//	画面タイルサイズの半分の幅
const	SCROLL		= 1;					//	スクロール速度
const	SMOOTH		= 0;					//	補間処理
const	START_X		= 15;					//	開始位置X
const	START_Y		= 17;					//	開始位置Y
const	TILECOLUMN	= 4;					//	タイル桁数
const	TILEROW		= 4;					//	タイル行数
const	TILESIZE	= 8;					//	タイルサイズ(ドット）
const	WNDSTYLE = "rgba( 0, 0, 0, 0.75 )";	//	ウィンドウの色
let		gPlayerX = START_X * TILESIZE + TILESIZE / 2;	//	プレイヤー座標X
let		gPlayerY = START_Y * TILESIZE + TILESIZE / 2;	//	プレイヤー座標Y

//メッセージ＆アイテム
let		gMessage1 = null;					 //	表示メッセージ１
let		gMessage2 = null;					 //	表示メッセージ２
let		gItem     = 0;						 //	所持アイテム
let     gItem2    = 0;                       // 所持アイテム2

//キー入力関連＋キャラ向き
const	gKey    = new Uint8Array( 0x100 );	//	キー入力バッファ
let		gAngle  = 0;						//	プレイヤーの向き
let		gCursor = 0;						//	戦闘時カーソル位置
let		gMoveX  = 0;						//	移動量X
let		gMoveY  = 0;						//	移動量Y

//プレイヤー関連
const	START_HP	= 25;					//	開始HP   20⇒25へ
let		gHP  = START_HP;					//	プレイヤーのHP
let		gMHP = START_HP;					//	プレイヤーの最大HP
let		gLv  = 1;							//	プレイヤーのレベル
let		gEx  = 0;							//	プレイヤーの経験値

//敵関連
let		gEnemyHP;							//	敵HP
let		gEnemyType;							//	敵種別

//戦闘フェーズ関連
let		gOrder;								//	行動順
let		gPhase = 0;							//	戦闘フェーズ

//画像データ
let		gImgBoss;							//	画像。ラスボス
let		gImgMap;							//	画像。マップ
let		gImgMonster;						//	画像。モンスター
let		gImgPlayer;							//	画像。プレイヤー

const	gFileBoss		= "img/bs.png";      //元  "img/boss.png";
const	gFileMap		= "img/map.png";
const	gFileMonster	= "img/mons.png";    //元　"img/monster.png";
const	gFilePlayer		= "img/player.png";


const	gMonsterName   = [ "スライム", "うさぎ", "ナイト", "ドラゴン", "魔王" ];	 //モンスター名称
const	gEncounter     = [ 0, 0, 0, 1, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0 ];	  //敵エンカウント確率(平地が1倍　林が2倍　山が3倍)
const   gEncounterrate = 24;                                                      //基本エンカウント倍率（低い程高い 基礎は8か16辺り）

//	マップ<z1>
const	gMap = [
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 3, 3, 3, 3, 7, 7, 7, 7, 7, 7, 7, 6, 6, 3, 6, 3, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 3, 3, 6, 6, 7, 7, 7, 2, 2, 2, 7, 7, 7, 7, 7, 7, 7, 6, 3, 0, 0, 0, 3, 3, 0, 6, 6, 6, 0, 0, 0,
 0, 0, 3, 3, 6, 6, 6, 7, 7, 2, 2, 2, 7, 2, 2, 2, 2, 7, 7, 6, 3, 3, 3, 6, 6, 3, 6,13, 6, 0, 0, 0,
 0, 3, 1,10,11, 3, 3, 6, 7, 7, 2, 2, 2, 4, 5, 2, 1, 1, 7, 6, 6, 6, 6, 6, 3, 0, 6, 6, 6, 0, 0, 0,
 0, 0, 3, 3, 3, 0, 3, 3, 3, 7, 7, 2, 2, 8, 9, 2, 1, 2, 1, 6, 6, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 7, 7, 7, 2, 2, 1, 1, 1, 1, 3, 6, 6, 6, 3, 0, 0, 0, 3, 3, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 7, 2, 1, 6, 3, 1, 3, 3, 6, 6, 3, 0, 0, 0, 3, 3, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 1, 1, 1, 6, 3, 1, 1, 3, 3, 6, 3, 3, 0, 0, 3, 3, 3, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 6, 7, 7, 7, 6, 3, 1, 1, 3, 3, 6, 3, 3, 0, 3,12, 3, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 6, 7, 7, 6, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 6, 6, 6, 6, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 6, 6, 3, 3, 3, 3, 1, 1, 3, 3, 3, 1, 1, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 5, 3, 3, 3, 6, 6, 6, 3, 3, 3, 1, 1, 1, 1, 1, 3, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 8, 9, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 1, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 3, 3, 3, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 6,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 6, 3, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,14, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0,
 7,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 3, 3, 0, 0, 0, 0, 0,
 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 7, 7,
];

let   musicon =0;
const music  = new Audio('yuusou-koushin.mp3');
const music2 = new Audio('Battle-forHonor.mp3');
const music3 = new Audio('button01b.mp3');
const music4 = new Audio('dashing.mp3');
const music5 = new Audio('Battle-Forbidden.mp3');
const music6 = new Audio('machi-march.mp3');

//	戦闘行動処理<z6>
function Action()
{
	gPhase++;											//	フェーズ経過
		
	if( ( ( gPhase + gOrder ) & 1 ) == 0 ){				//	敵の行動順の場合
		const	d = GetDamage( gEnemyType + 1 );        //  ダメージを+2⇒+1へ減少
		SetMessage( gMonsterName[ gEnemyType ] + "の攻撃！"+ d + " のダメージ！" );
		gHP -= d;										//	プレイヤーのHP減少
		if( gHP <= 0 ){									//	プレイヤーが死亡した場合
			gPhase = 7;									//	死亡フェーズ
		}
		return;
	}

	//	プレイヤーの行動順
	if( gCursor == 0 ){									//	「戦う」選択時
		const	d = GetDamage( gLv + 1 );				//	ダメージ計算結果取得
		SetMessage( "あなたの攻撃！　　　" + d + "のダメージ！" );
		gEnemyHP -= d;
		if( gEnemyHP <= 0 ){
			gPhase = 5;
		}
		return;
	}

	if( Math.random() < 0.6 ){							//	「逃げる」成功時  0.5⇒0.6へ
		SetMessage( "あなたは逃げ出した");
		gPhase = 6;
		music4.volume = 0.4;
	    music4.currentTime = 0;
		music2.pause();
		music4.play();
		music.volume = 0.4;
		music.loop = true;
		music.play();		
		return;
	}

	//	「逃げる」失敗時
	SetMessage( "あなたは逃げ出した　しかし回り込まれた！" );
}

//	経験値加算
function AddExp( val )
{
	gEx += val;											//	経験値加算
	while( gLv * ( gLv + 1 ) * 2 <= gEx ){				//	レベルアップ条件を満たしている場合
		gLv++;											//	レベルアップ
		gMHP += 5 + Math.floor( Math.random() * 3 );	//	最大HP上昇5～7(最低値4⇒5へ) 
	}
}

//	敵出現処理<z7>
function AppearEnemy( t )
{
	gPhase     = 1;							            //	敵出現フェーズ
	gEnemyHP   = t * 3 + 5;					            //	敵HP(5,8,11,14,18)
	if(t===4){
		gEnemyHP + 9;
	}
	gEnemyType = t;
	SetMessage( "敵が現れた！");
	music.pause();
	if( t != 4){		
		music2.volume = 0.4;
		music2.currentTime = 0;
		music2.play();
	}else{
		music5.volume = 0.4;
		music5.play();
	}
}

//	戦闘コマンド
function CommandFight()
{
	gPhase  = 2;				                        //	戦闘コマンド選択フェーズ
	gCursor = 0;
	SetMessage( "　戦う　　　　　　　　逃げる" );
}


//	戦闘画面描画処理<z8>
function DrawFight( g )
{
	g.fillStyle = "#000000";							  //	背景色
	g.fillRect( 0, 0, WIDTH, HEIGHT );					  //	画面全体を矩形描画

	if( gPhase <= 5 ){		                              //	敵が生存している場合
		if( IsBoss() ){	                                  //	ラスボスの場合の描画
			g.drawImage( gImgBoss, WIDTH / 2 - gImgBoss.width / 2, HEIGHT / 2 - gImgBoss.height / 2 );
		}else{
			let		w = gImgMonster.width / 4;
			let		h = gImgMonster.height;
			g.drawImage( gImgMonster, gEnemyType * w, 0, w, h, Math.floor( WIDTH / 2 - w / 2 ), Math.floor( HEIGHT / 2 - h / 2 ), w, h );	
		}
	}

	DrawStatus( g );									   //	ステータス描画
	DrawMessage( g );									   //	メッセージ描画
	if( gPhase == 2 ){									   //	戦闘フェーズがコマンド選択中の場合
		g.fillText( "⇒", 6, 96 + (14 * gCursor) );	      //	カーソル描画
	}
}

//	フィールド描画処理
function DrawField( g )
{
	music4.pause();	
	let		mx = Math.floor( gPlayerX / TILESIZE );			//	プレイヤーのタイル座標X
	let		my = Math.floor( gPlayerY / TILESIZE );			//	プレイヤーのタイル座標Y
	
	for( let dy = -SCR_HEIGHT; dy <= SCR_HEIGHT; dy++ ){
		let		ty = my + dy;								//	タイル座標Y
		let		py = ( ty + MAP_HEIGHT ) % MAP_HEIGHT;		//	ループ後タイル座標Y
		for( let dx = -SCR_WIDTH; dx <= SCR_WIDTH; dx++ ){
			let		tx = mx + dx;							//	タイル座標X
			let		px = ( tx + MAP_WIDTH  ) % MAP_WIDTH;	//	ループ後タイル座標X
			DrawTile( g,
			          tx * TILESIZE + WIDTH  / 2 - gPlayerX,
			          ty * TILESIZE + HEIGHT / 2 - gPlayerY,
			          gMap[ py * MAP_WIDTH + px ] );
		}
	}

	//	プレイヤー描画<5>
	g.drawImage( gImgPlayer,
	             ( gFrame >> 4 & 1 ) * CHRWIDTH, gAngle * CHRHEIGHT, CHRWIDTH, CHRHEIGHT,                //ビットシフトの意味は16で割って余りを省く　&　1　で0か1だけ返している
	             WIDTH / 2 - CHRWIDTH / 2, HEIGHT / 2 - CHRHEIGHT + TILESIZE / 2, CHRWIDTH, CHRHEIGHT ); //内部カウンタで歩き差分を表示している

	//	ステータスウィンドウ
	g.fillStyle = WNDSTYLE;							    //	ウィンドウの色
	g.fillRect( 2, 2, 44, 37 );						    //	矩形描画

	DrawStatus( g );								    //	ステータス描画
	DrawMessage( g );								    //	メッセージ描画
}

function DrawMain()
{
	const	g = gScreen.getContext( "2d" );				//	仮想画面の2D描画コンテキストを取得

	if( gPhase <= 1 ){
		DrawField( g );									//	フィールド画面描画
	}else{
		DrawFight( g );
	}
	
//デバッグウィンドウ
/*
	g.fillStyle = WNDSTYLE;							//	ウィンドウの色
	g.fillRect( 20, 3, 105, 15 );					//	矩形描画

	g.font = FONT;									//	文字フォントを設定
	g.fillStyle = FONTSTYLE;						//	文字色
	let		mx = Math.floor( gPlayerX / TILESIZE );			//	プレイヤーのタイル座標X
	let		my = Math.floor( gPlayerY / TILESIZE );			//	プレイヤーのタイル座標Y
	g.fillText( "x=" + gPlayerX + " y=" + gPlayerY + " m=" + gMap[ my * MAP_WIDTH + mx ], 25, 15 );
*/
}

//	メッセージ描画
function DrawMessage( g )
{
	if( !gMessage1 ){								//	メッセージ内容が存在しない場合
		return;
	}

	g.fillStyle = WNDSTYLE;							//	ウィンドウの色
	g.fillRect( 4, 84, 120, 30 );					//	矩形描画

	g.font = FONT;									//	文字フォントを設定
	g.fillStyle = FONTSTYLE;						//	文字色
	g.fillText( gMessage1, 6, 96 );					//	メッセージ１行目描画
	if( gMessage2 ){
		g.fillText( gMessage2, 6, 110 );			//	メッセージ２行目描画
	}
}

//	ステータス描画
function DrawStatus( g )
{	
	g.font = FONT;									            //	 文字フォントを設定
	g.fillStyle = FONTSTYLE;						            //	 文字色
	g.fillText( "Lv", 4, 13 );	DrawTextR( g, gLv, 36, 13 );	//	 Lv
	g.fillText( "HP", 4, 25 );	DrawTextR( g, gHP, 36, 25 );	//	 HP
	g.fillText( "Ex", 4, 37 );	DrawTextR( g, gEx, 36, 37 );	//	 Ex
}

function DrawTextR( g, str, x, y )                              //   文字表示（右揃え後元に戻している）   
{
	g.textAlign = "right";
	g.fillText( str, x, y );
	g.textAlign = "left";
}

function DrawTile( g, x, y, idx )
{
	const		ix = ( idx % TILECOLUMN ) * TILESIZE;
	const		iy = Math.floor( idx / TILECOLUMN ) * TILESIZE;
	g.drawImage( gImgMap, ix, iy, TILESIZE, TILESIZE, x, y, TILESIZE, TILESIZE );
}


//	ダメージ量算出
function GetDamage( a )
{
	return( Math.floor( a * ( 1 + Math.random() ) ) );	//	攻撃力の１～２倍
}

function IsBoss()
{
	return( gEnemyType == gMonsterName.length - 1 );
}

function LoadImage()
{
	gImgBoss    = new Image();	gImgBoss.src    = gFileBoss;	//	ラスボス画像読み込み
	gImgMap     = new Image();	gImgMap.src     = gFileMap;		//	マップ画像読み込み
	gImgMonster = new Image();	gImgMonster.src = gFileMonster;	//	モンスター画像読み込み
	gImgPlayer  = new Image();	gImgPlayer.src  = gFilePlayer;	//	プレイヤー画像読み込み
}

//function SetMessage( v1, v2 = null )	//	IE対応
//function SetMessage( v1, v2 )
function SetMessage( v1 )               //   メッセージの長さで分割へ変更
{
	if(v1.length>=11){
		gMessage1= v1.slice( 0, 10 );
		gMessage2= v1.slice( 10,v1.length);
	}else{
		gMessage1 = v1;
		gMessage2 = "";
    }
}

//	フィールド進行処理
function TickField()
{
	if( gPhase != 0 ){
		return;
	}
	
	if( gMoveX != 0 || gMoveY != 0 || gMessage1 ){}				//	移動中又はメッセージ表示中の場合
	else if( gKey[ 37 ] ){	gAngle = 1;	gMoveX = -TILESIZE;	}	//	左
	else if( gKey[ 38 ] ){	gAngle = 3;	gMoveY = -TILESIZE;	}	//	上
	else if( gKey[ 39 ] ){	gAngle = 2;	gMoveX =  TILESIZE;	}	//	右
	else if( gKey[ 40 ] ){	gAngle = 0;	gMoveY =  TILESIZE;	}	//	下

	//	移動後のタイル座標判定
	let		mx = Math.floor( ( gPlayerX + gMoveX ) / TILESIZE );	//	移動後のタイル座標X
	let		my = Math.floor( ( gPlayerY + gMoveY ) / TILESIZE );	//	移動後のタイル座標Y
	mx += MAP_WIDTH;								//	マップループ処理X
	mx %= MAP_WIDTH;								//	マップループ処理X
	my += MAP_HEIGHT;								//	マップループ処理Y
	my %= MAP_HEIGHT;								//	マップループ処理Y
	let		m = gMap[ my * MAP_WIDTH + mx ];		//	タイル番号
	if( m < 3 ){									//	侵入不可の地形の場合
		gMoveX = 0;									//	移動禁止X
		gMoveY = 0;									//	移動禁止Y
	}

	///  フィールドイベント ////////////////////////////////////////////////////////////////<z4>
	if( Math.abs( gMoveX ) + Math.abs( gMoveY ) == SCROLL ){	//	マス目移動が終わる直前
		if( m == 8 || m == 9 ){		//	お城
			gHP = gMHP;										    //	HP全回復
			//SetMessage( "魔王を倒して！");
			SetMessage( "魔王を倒してまいれ！HPが回復した。");
		}

		if( m == 10 || m == 11 ){	//	街
			gHP = gMHP;										    //	HP全回復
			SetMessage( "東にも村があります。HPが回復した。" );
		}

		if( m == 12 ){	//	村
			gHP = gMHP;										    //	HP全回復
			SetMessage( "洞窟には鍵があるよ　HPが回復した。" );
		}

		if( m == 13 ){	                                        //	洞窟
			if(gItem===0){
			gItem = 1;	                                        //	カギ入手
			SetMessage( "カギを手に入れた");
			music3.play();
			}
		}

		if( m == 14 ){	//	扉
			if( gItem == 0 ){			                        //	カギを保持していない場合
				gPlayerY -= TILESIZE;		                    //	１マス上へ移動
				SetMessage( "カギが必要です");
			}else if(gItem ===1){
				SetMessage( "扉が開いた");
				music3.play();
				gItem=2;
			}
		}

		if( m == 15 ){AppearEnemy( gMonsterName.length - 1 );}   //ボス処理
		if(gPlayerX===251&&gPlayerY===156){                      //座標によるイベントも可
			if(gItem2===0){
				SetMessage( "勇者よ力を授けよう・・・");
				AddExp(50);
				gItem2=1;
			}
		}
		///////////////////////////////////////////////////////////////////////////////////////	<z3>	
		if( Math.random() * gEncounterrate < gEncounter[ m ] ){	      //	ランダムエンカウント（初期位置から離れる程敵が強くなっていく仕組み）
			let		t = Math.abs( gPlayerX / TILESIZE - START_X ) +
			            Math.abs( gPlayerY / TILESIZE - START_Y );
			if( m == 6 ){		                                      //	マップタイプが林だった場合
				t += 8;									              //	敵レベルを0.5上昇
			}
			if( m == 7 ){		                                      //	マップタイプが山だった場合
				t += 16;								              //	敵レベルを1上昇
			}
			t += Math.random() * 8;						              //	敵レベルを0～0.5上昇
			t = Math.floor( t / 16 );
			t = Math.min( t, gMonsterName.length - 2 );	              //	上限処理
			AppearEnemy( t );
		}
	}

	gPlayerX += Math.sign( gMoveX ) * SCROLL;		//	プレイヤー座標移動X
	gPlayerY += Math.sign( gMoveY ) * SCROLL;		//	プレイヤー座標移動Y
	gMoveX   -= Math.sign( gMoveX ) * SCROLL;		//	移動量消費X
	gMoveY   -= Math.sign( gMoveY ) * SCROLL;		//	移動量消費Y

	//	マップループ処理
	gPlayerX += ( MAP_WIDTH  * TILESIZE );
	gPlayerX %= ( MAP_WIDTH  * TILESIZE );
	gPlayerY += ( MAP_HEIGHT * TILESIZE );
	gPlayerY %= ( MAP_HEIGHT * TILESIZE );
}

//	IE対応
/*
function Sign( val )
{
	if( val == 0 ){
		return( 0 );
	}
	if( val < 0 ){
		return( -1 );
	}
	return( 1 );
}
*/

function WmPaint()
{
	DrawMain();
	const	ca = document.getElementById( "main" );	                                    //	mainキャンバスの要素を取得
	const	g = ca.getContext( "2d" );				                                    //	2D描画コンテキストを取得
	g.drawImage( gScreen, 0, 0, gScreen.width, gScreen.height, 0, 0, gWidth, gHeight );	//	仮想画面のイメージを実画面へ転送
}

//	ブラウザサイズ変更イベント<z2>
function WmSize()
{
	const	ca = document.getElementById( "main" );	//	mainキャンバスの要素を取得
	const	g = ca.getContext( "2d" );				//	2D描画コンテキストを取得
		
	//	実画面サイズを計測。ドットのアスペクト比を維持したままでの最大サイズを計測する。       //  画面比計算部分
	ca.width  = window.innerWidth;				  	//	キャンバスの幅をブラウザの幅へ変更
	ca.height = window.innerHeight;					//	キャンバスの高さをブラウザの高さへ変更
	g.imageSmoothingEnabled = g.msImageSmoothingEnabled = SMOOTH;	                    //	補間処理
	gWidth  = ca.width;
	gHeight = ca.height;

	if( gWidth / WIDTH < gHeight / HEIGHT ){        //　縦横比を最適化
		gHeight = gWidth * HEIGHT / WIDTH;
	}else{
		gWidth = gHeight * WIDTH / HEIGHT;
	}
}

//	タイマーイベント発生時の処理<z0>
//  --約60fps　で描画////////////////////////////////////////////////////////////////////////////////////// 
//function WmTimer()
function onTimer(d)
{
	if( !gMessage1 ){
		while( d-- ){
		gFrame++;						      //内部カウンタを加算
		TickField();					      //フィールド進行処理
		}
	}
	WmPaint();                                //描画処理
}

function wmTimer()
{
	if( mCurrentStart === 0 ){				  //初回呼び出し時
		mCurrentStart = performance.now();	  //開始時刻の取得
	}

	let		d = Math.floor( ( performance.now() - mCurrentStart ) * INTERVAL2 / 1000 ) - mCurrentFrame;
	//console.log(d+","+mCurrentFrame);
	if( d > 0 ){                              //60fpsの場合約0.167ms　に到達した場合に描画（早すぎる場合は描画しない）		
		onTimer( d );                        
		mCurrentFrame += d;
	}
	requestAnimationFrame( wmTimer );         //使用しているPCパフォーマンスにより最適なタイミングで実行する
	
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////


//	キー入力(DONW)イベント
window.onkeydown = function( ev )
{
	let		c = ev.keyCode;			//	キーコード取得
	
	if( gKey[ c ] != 0 ){			//	既に押下中の場合（キーリピート）
		return;
	}
	
	gKey[ c ] = 1;
	
	if( gPhase == 1 ){				//	敵が現れた場合
		CommandFight();				//	戦闘コマンド
		return;
	}

	if( gPhase == 2 ){				//	戦闘コマンド選択中の場合
		if( c == 13 || c == 90 ){	//	Enterキー、又はZキーの場合
			gOrder = Math.floor( Math.random() * 2 );	//	戦闘行動順
			Action();				//	戦闘行動処理
		}else{
			gCursor = 1 - gCursor;	//	カーソル移動
		}
		return;
	}

	if( gPhase == 3 ){
		Action();					//	戦闘行動処理
		return;
	}

	if( gPhase == 4 ){
		CommandFight();				//	戦闘コマンド
		return;
	}

	if( gPhase == 5 ){
		gPhase = 6;
		AddExp( gEnemyType + 1 );	//	経験値加算
		SetMessage( "敵をやっつけた！");
		music2.pause();
		music3.play();
		music.volume = 0.4;
		music.loop = true;
		music.play();	
		return;
	}

	if( gPhase == 6 ){
		if( IsBoss() && gCursor == 0 ){		//	敵がラスボスで、かつ「戦う」選択時
			SetMessage( "魔王を倒し世界に平和が訪れた" );
			music5.pause();
			music6.play();
			return;
		}
		gPhase = 0;					//	マップ移動フェーズ
	}

	if( gPhase == 7 ){
		gPhase = 8;
		SetMessage( "あなたは死亡した");
		return;
	}

	if( gPhase == 8 ){
		SetMessage( "ゲームオーバー");
		return;
	}
	gMessage1 = null;
}

//	キー入力(UP)イベント キーを離した時入力無しへ
window.onkeyup = function( ev )
{
	gKey[ ev.keyCode ] = 0;
}

//	ブラウザ起動イベント
window.onload = function()
{
	LoadImage();
	gScreen = document.createElement( "canvas" );	//	仮想画面を作成
	gScreen.width  = WIDTH;							//	仮想画面の幅を設定
	gScreen.height = HEIGHT;						//	仮想画面の高さを設定

	WmSize();										//	画面サイズ初期化
	window.addEventListener( "resize", function(){ WmSize() } );	//	ブラウザサイズ変更時、WmSize()が呼ばれるよう指示
	//setInterval( function(){ WmTimer() }, INTERVAL );		//	33ms間隔で、WmTimer()を呼び出すよう指示（約30.3fps）
	requestAnimationFrame( wmTimer );               //PCパフォーマンスを元に約60fpsへ
}


