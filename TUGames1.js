"use strict";


var	TUG = TUG || {};
TUG.GR = {};

TUG.mCurrentFrame = 0;			
TUG.mFPS = 60;					//	フレームレート
TUG.mHeight = 120;				//	マップの高さ
TUG.mWidth = 128;				//	マップの幅


TUG.onTimer = function(){}


TUG.init = function()
{
	TUG.GR.mCanvas = document.createElement( "canvas" );        //	仮想画面の作成
	TUG.GR.mCanvas.width  = TUG.mWidth;							//	仮想画面の幅
	TUG.GR.mCanvas.height = TUG.mHeight;						//	仮想画面の高さ
	TUG.GR.mG = TUG.GR.mCanvas.getContext( "2d" );				//	仮想画面の2D描画のコンテキストの取得

	requestAnimationFrame( TUG.wmTimer );
}


//	IE対応
TUG.Sign = function( val )
{
	if( val == 0 ){
		return( 0 );
	}
	if( val < 0 ){
		return( -1 );
	}
	return( 1 );
}


TUG.wmTimer = function()
{
	if( !TUG.mCurrentStart ){					//	初回呼び出し時
		TUG.mCurrentStart = performance.now();	//	開始時刻の取得
	}

	let		d = Math.floor( ( performance.now() - TUG.mCurrentStart ) * TUG.mFPS / 1000 ) - TUG.mCurrentFrame;
	if( d > 0 ){
		TUG.onTimer( d );
		TUG.mCurrentFrame += d;
	}

	requestAnimationFrame( TUG.wmTimer );
}
