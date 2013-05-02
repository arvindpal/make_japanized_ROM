'========================================================================
DEBUG_PRINT=0
DEBUG_PRINT_GUI=0
WorkDir=""
'========================================================================
Function DebugPrint(string)
	if DEBUG_PRINT=1 then
		if UCase(Right(WScript.FullName, 11)) = "WSCRIPT.EXE" Then
		'GUI�N���̏ꍇ
			if DEBUG_PRINT_GUI=1 then
				WScript.Echo string
			end If
		else
		'CUI�N���̏ꍇ
			WScript.Echo string
		end If
	end if
End Function

'========================================================================
function GetArgString(objWshNamed , name ,def_val )
	val	= def_val
	
	if objWshNamed.Exists(name) then
		val = objWshNamed.Item(name)
	end if
	GetArgString = val
End Function
'========================================================================
function getOnOff( str , default)

	if UCase(str) = "ON" then
		getOnOff = 1
	else 
		if UCase(str) = "OFF" then
			getOnOff = 0
		else
			getOnOff = default
		end if
	end if
End Function

'========================================================================
function GetArgOnOff(objWshNamed,name,def_val)
	def = getOnOff(def_val,0)
	GetArgOnOff = getOnOff(GetArgString(objWshNamed,name,def_val),def)
End Function

'========================================================================
' JScript�ŊO���R�}���h�����܂����������ɂȂ�Ȃ������̂�VBS��
Function run_command(cmd)
	Dim objWShell

	Set objWShell = CreateObject("WScript.Shell")

	objWShell.CurrentDirectory = WorkDir
	DebugPrint "CMD= " & cmd
	'objWShell.Run cmd, vbNormalFocus, False
	'objWShell.Run cmd, vbNormalFocus, True

	Set objExec = objWShell.Exec(cmd)
	Do While objExec.Status = 0
		Do Until objExec.StdOut.AtEndOfStream
			DebugPrint objExec.StdOut.ReadLine
		Loop
	    WScript.Sleep 100
	Loop
 
 	Do Until objExec.StdOut.AtEndOfStream
		DebugPrint objExec.StdOut.ReadLine
	Loop
 
	objWShell = none
End Function
'========================================================================
' JScript�ŃJ�����g�f�B���N�g���ύX�ł��Ȃ��悤�Ȃ̂�
Function SetCurrDir(dir)
	WorkDir = dir
End Function
