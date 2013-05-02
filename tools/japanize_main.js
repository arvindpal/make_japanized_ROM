//==================================================================
// Internal use only (do not edit here)
var SCRIPT_DIR	= String(WScript.ScriptFullName).replace(WScript.ScriptName,"");
var objFso		= WScript.CreateObject("Scripting.FileSystemObject") ;

var objWshNamed	 	= WScript.Arguments.Named;
var	objWshUnnamed	= WScript.Arguments.Unnamed;

//  �I�[�v�����[�h
var FORREADING      = 1;    // �ǂݎ���p
var FORWRITING      = 2;    // �������ݐ�p
var FORAPPENDING    = 8;    // �ǉ���������

//  �J���t�@�C���̌`��
var TRISTATE_TRUE       = -1;   // Unicode
var TRISTATE_FALSE      =  0;   // ASCII
var TRISTATE_USEDEFAULT = -2;   // �V�X�e���f�t�H���g
//==================================================================
/*==================================================================
Memo:

<any_place>
  + diff
  |  + system
  |  |  + xxxx
  |  + boot.img
  + tool   
  |  +7z.exe
  |  +appt.exe
  |  + etc...
  + out
  |  + work (temporaly use)
  |  |  +temp
  |  |  |   +META-INF
  |  |  |   +system
  |  |  +temp.zip  (copy from user)
  |  + complete.zip
  + test.js (this file)
*/

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
	var val = getTextFile( src );
	val =String(val).replace(/ *= /	,"=");	//prop��`�̐��`

	val =val.replace(/ro.product.model=.*/	,"ro.product.model="+ro_product_model);
	val =val.replace(/ro.product.brand=.*/	,"ro.product.brand="+ro_product_brand);
	val =val.replace(/ro.product.name=.*/	,"ro.product.name="+ro_product_name);
	val =val.replace(/ro.product.device=.*/	,"ro.product.device="+ro_product_device);
	val =val.replace(/ro.product=.*/		,"ro.product="+ro_product);

	val =val.replace(/ro.build.description=.*/	,"ro.build.description="+ro_build_description);
	val =val.replace(/ro.build.fingerprint=.*/	,"ro.build.fingerprint="+ro_build_fingerprint);
	val =val.replace(/ro.factory.model=.*/		,"ro.factory.model="+ro_factory_model);

	val =val.replace(/ro.config.*=.*/		,"");

	val	+= "\n# Add \n";
	val	+= "ro.config.libemoji=libemoji_docomo.so\n";

	outputTextFile(dst,val);
}

//------------------------------------------------------------------
function replaceUpdateScript(src,dst)
{
	var val = getTextFile( src );
	for(i=0;i<(UPDATE_SCRIPT_CONF.lenght/2 -1);i++)	//exclude dummy line
	{
		val =String(val).replace(UPDATE_SCRIPT_CONF[i*2]	,UPDATE_SCRIPT_CONF[(i*2)+1]);
	}
	outputTextFile(dst,val);
}
//------------------------------------------------------------------
function addFelicaResouceItem(src,dst)
{
	var val = getTextFile( src );

	//js�Ȃ̂�xml�A�N�Z�X�Œǉ��ł��邯�ǂ�....
	val =String(val).replace(/<item>clock</,"<item>clock</item>\n<item>felica_lock</item>");
	outputTextFile(dst,val);
}
//=======================================================================================
//
//	file access
//
//=======================================================================================
function getTextFile( fileName )
{
	var objTxt	= objFso.OpenTextFile(fileName, FORREADING, false, TRISTATE_USEDEFAULT);
	var ret		= objTxt.ReadAll();
	objTxt.Close();
	return ret;
}

/*text file�o��(���s�R�[�h�ϊ�����)*/
function outputTextFile( path , val )
{
	val =String(val).replace("\r","");	//���s�R�[�h�ϊ�

	var file = objFso.OpenTextFile( path, FORWRITING, true, TRISTATE_FALSE );
	file.Write(val);
	file.Close();
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
}
//------------------------------------------------------------------
/*zip���w�肵�āA�w��p�X�̃t�@�C���̂ݎ��o������*/
function getFileFromZip(src,dst,path)
{
	///@todo
}
//------------------------------------------------------------------
/*zip���w�肵�āAbuild.prop�̂ݎ��o������*/
function getBuildProp(src,dst)
{
	getFileFromZip(src,dst,"system/build.prop");
}
//------------------------------------------------------------------
/*zip���w�肵�āAupdater-script�̂ݎ��o������*/
function getUpdaterScript(src,dst)
{
	getFileFromZip(src,dst,"META-INF/com\google/android/updater-script");
}
//------------------------------------------------------------------
/*zip���w�肵�āAframework-res.apk�̂ݎ��o������*/
function getFramworkResApk(src,dst)
{
	getFileFromZip(src,dst,"system/framework/framework-res.apk");
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
	///@todo
}
//------------------------------------------------------------------
/*framework-res���r���h����*/
function buildFramworkResApk(src,dst)
{
	///@todo
}
//------------------------------------------------------------------
/*signed zip����*/
function signZip(src,dst)
{
	///@todo
	/*
	java -jar ..\tools\apktool.jar b framework-res framework-res-tmp.apk
	..\tools\7z u -tzip -mx=0 framework-res.apk .\framework-res\build\apk\resources.arsc
	del ..\work1\system\framework\framework-res.apk
	copy framework-res.apk ..\work1\system\framework
	*/
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
	//for Test
	var prop	= SCRIPT_DIR + "build.prop"
	var update	= SCRIPT_DIR + "updater-script"
	var xml		= SCRIPT_DIR + "arrays.xml"


	//copy to work from user seleced zip here

	//getBuildProp(src,dst);
	replaceProp(prop,prop+"2");
	//AddFileToZip(zip,src)

	//getUpdaterScript(src,dst);
	//replaceUpdateScript(update,update+"2")
	//AddFileToZip(zip,src)

	//getFramworkResApk(src,dst);
	//addFelicaResouceItem(xml,xml+"2")
	//buildFramworkResApk(src,dst)
	//AddFileToZip(zip,src)


	//AddFileToZip(zip,src);	//diff/system
	//AddFileToZip(zip,src);	//boot.img

	//signZip(src,dst)

}
