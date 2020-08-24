import React from 'react';

import './styles.css';

export default function Query() {
   return (
      <div id="helpContainer" className="firstContainer container">
         <h5 className="titleTutorial">OLÁ!</h5>
         <p>
            Seja bem vindo ao GeoSQL, um ambiente online de aprendizado de SQL, aliado a extensões
            geográficas para melhor visualização dos resultados. Nesta página, será apresentado um
            rápido tutorial de uso da plataforma, assim como algumas diretivas a se seguir para
            correto funcionamento da mesma. Vamos lá!
         </p>
         <p>Ao acessar o sistema, você será defrontado com a seguinte página: </p>

         <img className="imgTutorial" src="imagens/Página_Inicial.png" alt="Página Inicial" />

         <p>
            Aqui você pode acessar as informações referentes à criação e desenvolvimento do GeoSQL,
            ou também visualizar os contatos dos principais responsáveis pelo projeto, assim como
            acessar a página do mesmo no GitHub. Quando estiver pronto, selecione o banco de dados
            ao qual deseja conectar-se e clique em Iniciar. Você será levado à página abaixo:{' '}
         </p>

         <img className="imgTutorial" src="imagens/Página_Consulta.png" alt="Página de Consulta" />

         <p>
            Temos várias informações na tela, então destrincharemo-as aos poucos para melhor
            entendimento:{' '}
         </p>
         <ol className="listTutorial">
            <li>
               Nesta área, temos as abas que compõem o sistema. "Consulta" refere-se à aba atual,
               "Tabela" mostra os resultados discretos obtidos, assim como opções de armazenamento,
               e, por fim, "Mapa" é a aba responsável por demonstrar os resultados geograficamente,
               com várias opções de personalização das camadas. Falaremos mais das duas outras abas
               em breve.
            </li>
         </ol>

         <h5 className="titleTutorial">
            <strong>ABA "CONSULTA"</strong>
         </h5>
         <ol className="listTutorial" start={2}>
            <li>
               Aqui encontram-se as tabelas do banco de dados escolhido. A apresentação das mesmas
               visa dar suporte e facilitar na confecção das consultas.
            </li>
            <li>
               Será neste campo que você digitará a consulta que deseja fazer (siga para a seção
               "Avisos" para algumas diretivas de boa utilização do sistema).
            </li>
            <li>
               Ao clicar neste botão, sua consulta será enviada ao banco de dados e os resultados,
               se disponíveis, retornados.
            </li>
            <li>Botão que realiza o armazenamento da consulta criada, em formato txt.</li>
            <li>Acessa a página em que você se encontra.</li>
         </ol>

         <h5 className="titleTutorial">
            <strong>ABA "TABELA"</strong>
         </h5>

         <img className="imgTutorial" src="imagens/Página_Tabela.png" alt="Página de Resultados" />

         <ol className="listTutorial">
            <li>
               Deste lado, temos botões referentes ao armazenamento da tabela resultante da
               consulta, em diferentes formatos.
            </li>
            <li>
               Aqui encontram-se os resultados obtidos da última consulta. Em caso de erro, será
               exibida a respectiva mensagem retornada pelo Postgres.
            </li>
         </ol>

         <h5 className="titleTutorial">
            <strong>ABA "MAPA"</strong>
         </h5>

         <img className="imgTutorial" src="imagens/Página_Mapa.png" alt="Página do Mapa" />

         <ol className="listTutorial">
            <li>
               Esta barra serve para ajustar o nível de zoom do mapa (pode ser feito através do
               scroll do mouse).
            </li>
            <li>
               Botão referente à apresentação da legenda de camadas (clique para alternar entre
               visível e não visível).
            </li>
            <li>
               Menu que permite escolher a cor de preenchimento, o tamanho (em caso de pontos) e o
               formato (novamente, em caso de pontos) da geometria.
            </li>
            <li>
               Menu que permite escolher a cor e a grossura das linhas de contorno das geometrias.
            </li>
            <li>
               Menu que permite escolher o rótulo (coluna) cujos valores serão exibidos no mapa.
            </li>
            <li>Botão que permite alternar a visibilidade da camada.</li>
            <li>Botão que realiza o download e armazenamento das informações da camada.</li>
            <li>Botão que deleta a camada do mapa.</li>
            <li>
               Número* que representa a posição em que a camada foi gerada desde a abertura ou
               última atualização de página do sistema.
            </li>
         </ol>
         <small>
            *Camada 0 refere-se à camada do mapa em si, e, se deletada por acidente, faz-se
            necessário atualizar a página para gerá-la novamente.
         </small>

         <h5 className="titleTutorial" id="warning">
            AVISOS!!!
         </h5>
         <ul className="listTutorial">
            <li>
               Não requisite mais de uma geometria por consulta. Pode acarretar mau funcionamento do
               sistema.
            </li>
            <li>
               Ao utilizar funções de agregação (como ST_Union, por exemplo), utilize "as geom". Por
               exemplo: "select ST_Union(e1.geom, e2.geom) <strong> as geom </strong> from estado as
               e1, estado as e2 where e1.sigla = 'MG' and e2.sigla = 'BA'". Esta denominação é
               essencial para o correto retorno da consulta.
            </li>
            <li>
               Em caso de demora excessiva para retorno dos resultados, é possível que tenha havido
               um erro de digitação na confecção da consulta, e o PostgreSQL não consiga encontrar o
               desejado. Neste caso, porém, o SGBD não retornará uma mensagem de erro, e pode ser
               necessária uma atualização da página e reconfecção da query.
            </li>
            <li>
               Em caso de mau funcionamento dos servidores responsáveis por manterem os bancos de
               dados, nenhuma tabela será mostrada na aba "consulta". Nessa ocasião, aguarde o
               servidor recuperar seu funcionamento e tente novamente posteriormente.
            </li>
         </ul>

         <h5 className="titleTutorial">LINKS ÚTEIS</h5>
         <ul className="listTutorial">
            <li>
               <a href="https://www.postgresql.org/docs/12/index.html" className="linkTutorial">
                  Documentação PostgreSQL
               </a>
            </li>
            <li>
               <a href="https://postgis.net/docs/manual-3.0/" className="linkTutorial">
                  Documentação PostGIS
               </a>
            </li>
         </ul>
      </div>
   );
}
