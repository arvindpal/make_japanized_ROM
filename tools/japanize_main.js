//==================================================================
// Internal use only (do not edit here)
var objFso		= WScript.CreateObject("Scripting.FileSystemObject") ;

var objWshNamed	 	= WScript.Arguments.Named;
var	objWshUnnamed	= WScript.Arguments.Unnamed;

//==================================================================
//	FileSystemObject
//  �I�[�v�����[�h
var FORREADING      = 1;    // �ǂݎ���p
var FORWRITING      = 2;    // �������ݐ�p
var FORAPPENDING    = 8;    // �ǉ���������

//  �J���t�@�C���̌`��
var TRISTATE_TRUE       = -1;   // Unicode
var TRISTATE_FALSE      =  0;   // ASCII
var TRISTATE_USEDEFAULT = -2;   // �V�X�e���f�t�H���g
//==================================================================
// ADODB.Stream
		// STREAMTYPEENUM
		// HTTP://MSDN.MICROSOFT.COM/JA-JP/LIBRARY/CC389884.ASPX
var ADTYPEBINARY = 1; // �o�C�i��
var ADTYPETEXT   = 2; // �e�L�X�g

// �ǂݍ��ݕ��@
var ADREADALL  = -1; // �S�s
var ADREADLINE = -2; // ��s����

// �������ݕ��@
var ADWRITECHAR = 0; // ���s�Ȃ�
var ADWRITELINE = 1; // ���s����

// �t�@�C���̕ۑ����@
var ADSAVECREATENOTEXIST  = 1; // �Ȃ��ꍇ�͐V�K�쐬
var ADSAVECREATEOVERWRITE = 2; // ����ꍇ�͏㏑��

/*==================================================================
Memo:
<any_place>/  = SCRIPT_DIR
  + diff/
  |  + system/
  |  |  + xxxx
  |  + boot.img
  + tools/
  |  +7z.exe
  |  +japanize_config_xxxx.js
  |  +japanize_main.js
  |  +japanize_util.vbs
  |  + etc...
  + out/
  |  + work/ (temporaly use)
  |  |  +user/
  |  |  |   +META-INF
  |  |  |   +system
  |  |  +temp/
  |  |  |   +framework-res/
  |  |  |   +framework-res-tmp.apk
  |  |  +user.zip  (copy from user)
  |  + complete.zip
  + make_japanized_ROM.wsf
*/
// Folder definition
var SCRIPT_DIR	= String(WScript.ScriptFullName).replace(WScript.ScriptName,"");
var DIFF_DIR	= objFso.BuildPath(SCRIPT_DIR	, "diff");

//tool path
var TOOL_DIR	= objFso.BuildPath(SCRIPT_DIR	, "tools");
var EXE_7z		= objFso.BuildPath(TOOL_DIR		, "7z.exe");
var APKTOOL		= "java -jar " + objFso.BuildPath(TOOL_DIR		, "apktool.jar");

//working path
var OUT_DIR		= objFso.BuildPath(SCRIPT_DIR	, "out");
var WORK_DIR	= objFso.BuildPath(OUT_DIR		, "work");
var USER_DIR	= objFso.BuildPath(WORK_DIR		, "user");
var TEMP_DIR	= objFso.BuildPath(WORK_DIR		, "temp");

var USER_ZIP	= objFso.BuildPath(WORK_DIR		, "user.zip");

var BUILD_PROP			= "system/build.prop";
var UPDATER_SCRIPT		= "META-INF/com/google/android/updater-script";
var FRAMEWORK_RES		= "system/framework/framework-res.apk";


var WORK_BUILD_PROP			= objFso.BuildPath(USER_DIR				, BUILD_PROP				).replace(new RegExp("\\/","g"),"\\");
var WORK_UPDATER_SCRIPT		= objFso.BuildPath(USER_DIR				, UPDATER_SCRIPT			).replace(new RegExp("\\/","g"),"\\");
var WORK_FRAMEWORK_RES_APK	= objFso.BuildPath(USER_DIR				, FRAMEWORK_RES				).replace(new RegExp("\\/","g"),"\\");

//------
var TMP_FRAMEWORK_DIR		= objFso.BuildPath(TEMP_DIR				, "framework-res"			).replace(new RegExp("\\/","g"),"\\");
var TMP_ARRAYS_XML			= objFso.BuildPath(TMP_FRAMEWORK_DIR	, "res/values/arrays.xml"	).replace(new RegExp("\\/","g"),"\\");
var TMP_FRAMEWORK_APK		= objFso.BuildPath(TEMP_DIR				, "framework-res.apk"		).replace(new RegExp("\\/","g"),"\\");

SetCurrDir(SCRIPT_DIR);
//get debug parameter
DEBUG_PRINT			= GetArgOnOff(objWshNamed	,"dbg"		,"OFF"				);
DEBUG_PRINT_GUI		= GetArgOnOff(objWshNamed	,"dbg_gui"	,"OFF"				);
//=======================================================================================
//
//	replace for jpn device
//
//=======================================================================================
//------------------------------------------------------------------
function replaceProp(src,dst)
{
	var val = getTextFile( src ,"euc-jp");
	val =String(val).replace(new RegExp(" *= ","g")	,"=");	//prop��`�̐��`


	val =val.replace(new RegExp("ro.product.model=.*", "g")		,"ro.product.model="+ro_product_model);
	val =val.replace(new RegExp("ro.product.brand=.*", "g")		,"ro.product.brand="+ro_product_brand);
	val =val.replace(new RegExp("ro.product.name=.*", "g")		,"ro.product.name="+ro_product_name);
	val =val.replace(new RegExp("ro.product.device=.*", "g")	,"ro.product.device="+ro_product_device);
	val =val.replace(new RegExp("ro.product=.*", "g")			,"ro.product="+ro_product);

	val =val.replace(new RegExp("ro.build.description=.*", "g")	,"ro.build.description="+ro_build_description);
	val =val.replace(new RegExp("ro.build.fingerprint=.*", "g")	,"ro.build.fingerprint="+ro_build_fingerprint);
	val =val.replace(new RegExp("ro.factory.model=.*", "g")		,"ro.factory.model="+ro_factory_model);

	val =val.replace(new RegExp("ro.config.*=.*","g")			,"");
	val	+= "\n# Add \n";
	val	+= "ro.config.libemoji=libemoji_docomo.so\n";

	outputTextFile(dst,val,"euc-jp");
}

//------------------------------------------------------------------
function replaceUpdateScript(src,dst)
{
	var val = getTextFile( src ,"euc-jp");
	for(i=0;i<(UPDATE_SCRIPT_CONF.length/2 -1);i++)	//exclude dummy line
	{
		DebugPrint( "[replaceUpdateScript] :"+UPDATE_SCRIPT_CONF[i*2] + " -> "+ UPDATE_SCRIPT_CONF[i*2 +1]  );
		val =String(val).replace(new RegExp(UPDATE_SCRIPT_CONF[i*2])	,UPDATE_SCRIPT_CONF[(i*2)+1]);
	}
	outputTextFile(dst,val ,"euc-jp");
}
//------------------------------------------------------------------
function addFelicaResouceItem(src,dst)
{
	var val = getTextFile( src ,"utf-8" );

	//js�Ȃ̂�xml�A�N�Z�X�Œǉ��ł��邯�ǂ�....
	val =String(val).replace(/<item>clock</,"<item>clock</item>\n<item>felica_lock<");
	outputTextFile(dst,val	,"utf-8" );
}
//=======================================================================================
//
//	file access
//
//=======================================================================================

function getTextFile( fileName ,encoding)
{
	var inputStream = new ActiveXObject("ADODB.Stream");
	inputStream.Type = ADTYPETEXT;
	inputStream.charset = encoding;
	inputStream.Open();
	inputStream.LoadFromFile( fileName );
	var ret = inputStream.ReadText( ADREADALL );
	inputStream.Close();

	return ret;
}


/*text file�o��(���s�R�[�h�ϊ�����)*/
function outputTextFile( path , val ,encoding)
{
	val =String(val).replace("\r","");	//���s�R�[�h�ϊ�

	var outputStream = new ActiveXObject("ADODB.Stream");
	outputStream.Type = ADTYPETEXT;
	outputStream.charset = encoding;
	outputStream.Open();
	outputStream.WriteText(val,ADWRITECHAR);
	outputStream.SaveToFile( path , ADSAVECREATEOVERWRITE );
	outputStream.Close();
}

//=======================================================================================
//
//	zip file access
//
//=======================================================================================
//------------------------------------------------------------------
/*zip�փt�@�C���ǉ�����*/
function AddFileToZip(zip,src)
{
	///@todo
	//var cmd = EXE_7z +" a " + zip + " " + src + " -r";
	var cmd = EXE_7z +" u " + zip + " " + src + " -r";
	//run_command(cmd);
}
//------------------------------------------------------------------
/*zip���w�肵�āA�w��p�X�̃t�@�C���̂ݎ��o������*/
function getFileFromZip(zip,dst,path)
{
	var cmd = EXE_7z +" x " + zip + " -o"+dst + " " + path + " -r -aoa";
	run_command(cmd);
}
//------------------------------------------------------------------
/*zip���w�肵�āAbuild.prop�̂ݎ��o������*/
function getBuildProp(zip,dst)
{
	getFileFromZip(zip,dst,BUILD_PROP);
}
//------------------------------------------------------------------
/*zip���w�肵�āAupdater-script�̂ݎ��o������*/
function getUpdaterScript(zip,dst)
{
	//META-INF\com\google\android
	getFileFromZip(zip,dst,UPDATER_SCRIPT);
}
//------------------------------------------------------------------
/*zip���w�肵�āAframework-res.apk�̂ݎ��o������*/
function getFramworkResApk(zip,dst)
{
	getFileFromZip(zip,dst,FRAMEWORK_RES);
}

//=======================================================================================
//
//	tool Access
//
//=======================================================================================
//------------------------------------------------------------------
/*framework-res���f�R�[�h����*/
function decodeFramworkResApk(src,dst)
{
	DebugPrint( "[decodeFramworkResApk] enter");
	//java -jar ..\tools\apktool.jar d framework-res.apk framework-res
	var cmd = APKTOOL + " d " + src + " "+ dst;
	run_command(cmd);
}
//------------------------------------------------------------------
/*framework-res���r���h����*/
function buildFramworkResApk(src_dir,tmp_apk,dst_apk)
{
	/*
	java -jar ..\tools\apktool.jar b framework-res framework-res-tmp.apk
	..\tools\7z u -tzip -mx=0 framework-res.apk .\framework-res\build\apk\resources.arsc
	del ..\work1\system\framework\framework-res.apk
	copy framework-res.apk ..\work1\system\framework
	*/
	var resources = objFso.BuildPath(src_dir,"build\\apk\\resources.arsc");

	var cmd = APKTOOL + " b " + src_dir + " "+ tmp_apk;
	run_command(cmd);
	cmd = EXE_7z +" u -tzip -mx=0 " + dst_apk + " " + resources;

	run_command(cmd);
	//objFso.DeleteFile(tmp_apk);
}
//------------------------------------------------------------------
/*signed zip����*/
function signZip(src,dst)
{
	///@todo

}

//=======================================================================================
//
//	tool Access
//
//=======================================================================================
function show_copyright()
{
//make_japanized_ROM

}

//=======================================================================================
//
//	main process
//
//=======================================================================================
//------------------------------------------------------------------
function japanize_process()
{
	//copy to work from user seleced zip here

	getBuildProp(USER_ZIP,USER_DIR);
	replaceProp(WORK_BUILD_PROP,WORK_BUILD_PROP+"_build.after");	//debug

	getUpdaterScript(USER_ZIP,USER_DIR);
	replaceUpdateScript(WORK_UPDATER_SCRIPT,WORK_UPDATER_SCRIPT+"_build.after");

	getFramworkResApk(USER_ZIP,USER_DIR);
	decodeFramworkResApk(WORK_FRAMEWORK_RES_APK,TMP_FRAMEWORK_DIR);
	
	addFelicaResouceItem(TMP_ARRAYS_XML,TMP_ARRAYS_XML+"_build.after")

	buildFramworkResApk(TMP_FRAMEWORK_DIR,TMP_FRAMEWORK_APK,WORK_FRAMEWORK_RES_APK)

	//copy diffs to temp here
		
	//AddFileToZip(zip,src);

	//signZip(src,dst)

}
