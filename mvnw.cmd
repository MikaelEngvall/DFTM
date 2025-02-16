@echo off
setlocal EnableDelayedExpansion

set MAVEN_PROJECTBASEDIR=%CD%
set MAVEN_CMD_LINE_ARGS=%*

"%JAVA_HOME%\bin\java.exe" ^
  -classpath ".mvn\wrapper\maven-wrapper.jar" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*

endlocal
