; === Sidebar Image Macros ===
!macro customSidebar
  !define MUI_WELCOMEFINISHPAGE_BITMAP "${BUILD_RESOURCES_DIR}/installerSidebar.bmp"
!macroend

!macro customUnSidebar
  !define MUI_UNWELCOMEFINISHPAGE_BITMAP "${BUILD_RESOURCES_DIR}/uninstallerSidebar.bmp"
!macroend

; === Initialization Macros ===
!macro preInit
!macroend

!macro customInit
  ; Vérifie s'il existe une ancienne installation
  ReadRegStr $R0 HKCU "Software\Lumina" "InstallPath"
  ${If} $R0 != ""
    MessageBox MB_ICONINFORMATION|MB_OK "An old installation of Lumina is detected at: $R0$\r$\nThis installer will update it."
  ${EndIf}

  ; Supprimer ancienne installation
  IfFileExists "$PROGRAMFILES\Lumina\*" 0 +3
    MessageBox MB_YESNO "Old version found in Program Files. Remove it before installing?" IDNO +2
    RMDir /r "$PROGRAMFILES\Lumina"

  ; Vérifie si l'utilisateur est admin
  UserInfo::GetAccountType
  Pop $0
  ${If} $0 != "admin"
    MessageBox MB_ICONSTOP "Administrator rights are required to install Lumina."
    Abort
  ${EndIf}

  ; Sélection du mode d'installation
  !insertmacro customInstallMode
!macroend

; === Installation Mode Macro ===
!macro customInstallMode
  MessageBox MB_YESNO "Do you want to install Lumina for all users (requires admin)?" IDYES +3
    StrCpy $INSTDIR "$LOCALAPPDATA\Lumina"
    Goto +2
    StrCpy $INSTDIR "$PROGRAMFILES\Lumina"
!macroend

; === Installation Macros ===
!macro customInstall
  ; Création du répertoire d'installation
  CreateDirectory "$INSTDIR"

  ; Copier le fichier principal (juste un exemple)
  ; File /r "dist\*.*"

  ; Créer un raccourci sur le bureau
  CreateShortCut "$DESKTOP\Lumina.lnk" "$INSTDIR\Lumina.exe"

  ; Écrire le chemin d'installation dans la base de registre
  WriteRegStr HKCU "Software\Lumina" "InstallPath" "$INSTDIR"
!macroend

; === Pages Macros ===
!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to Lumina Uninstall"
  !define MUI_WELCOMEPAGE_TEXT "This will remove Lumina from your computer.$\r$\nClick Next to continue."
  !insertmacro MUI_UNPAGE_WELCOME
!macroend

!macro customFinishPage
  !define MUI_FINISHPAGE_RUN "$INSTDIR\Lumina.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "Launch Lumina after installation"
  !insertmacro MUI_PAGE_FINISH
!macroend
