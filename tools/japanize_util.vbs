'========================================================================
DEBUG_PRINT=0
DEBUG_PRINT_GUI=0
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
