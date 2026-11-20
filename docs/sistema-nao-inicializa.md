# Sistema não inicializa

## Sintomas
- O Windows não inicia, fica na tela de carregamento
- Aparece erro "Sistema operacional não encontrado"
- O computador fica na tela da placa-mãe e não avança
- Aparece tela preta com cursor piscando
- O Windows inicia em modo de recuperação

## Causas comuns
- Disco rígido com defeito
- Arquivos do sistema corrompidos
- Boot configurado errado na BIOS
- Atualização do Windows com falha
- Dispositivo USB conectado impedindo o boot

## Solução passo a passo
1. Remova todos os dispositivos USB (pen drives, HDs externos) e reinicie.
2. Verifique se o disco rígido está selecionado como dispositivo de boot na BIOS.
3. Inicie o Windows em Modo de Segurança (pressionando F8 ou Shift+F8 durante o boot).
4. Use o Ambiente de Recuperação do Windows para reparar o sistema.
5. Execute a verificação de arquivos do sistema: sfc /scannow no Prompt de Comando.
6. Se não conseguir iniciar, use um pendrive de instalação do Windows para reparar.
7. Se o disco não for detectado, pode ser problema de hardware.

## Quando abrir chamado
Se o sistema não inicializar depois de remover dispositivos USB e tentar reparar, abra um chamado informando o modelo, se aparece alguma mensagem de erro e se o disco é detectado na BIOS.
