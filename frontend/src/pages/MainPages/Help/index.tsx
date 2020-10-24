import React from 'react';

import Landing from './Prints/Landing.png';
import Query from './Prints/Query.png';
import Results from './Prints/Results.png';
import Map from './Prints/Map.png';

import './styles.css';

export default function Help() {
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
         <br />

         <img className="imgTutorial" src={Landing} alt="Página Inicial" />

         <br />
         <p>
            Aqui você pode acessar as informações referentes à criação e desenvolvimento do GeoSQL,
            ou também visualizar os contatos dos principais responsáveis pelo projeto, assim como
            acessar a página do mesmo no GitHub. Quando estiver pronto, selecione o banco de dados
            ao qual deseja conectar-se e clique em Iniciar. Você será levado à página abaixo:{' '}
         </p>
         <br />

         <img className="imgTutorial" src={Query} alt="Página de Consulta" />

         <br />
         <p>
            Temos várias informações na tela, então destrincharemo-as aos poucos para melhor
            entendimento:{' '}
         </p>
         <ol className="listTutorial">
            <li>Clique na logo caso deseje voltar à tela principal.</li>
            <li>
               Nesta área, temos as abas que compõem o sistema. "Consulta" refere-se à aba atual,
               "Tabela" mostra os resultados discretos obtidos, assim como opções de armazenamento,
               e. Por fim, "Mapa" é a aba responsável por demonstrar os resultados geograficamente,
               com várias opções de personalização das camadas. Falaremos mais das duas outras abas
               em breve.
            </li>
         </ol>

         <h5 className="titleTutorial">
            <strong>ABA "CONSULTA"</strong>
         </h5>
         <ol className="listTutorial" start={3}>
            <li>
               Aqui encontram-se as tabelas do banco de dados escolhido. A apresentação das mesmas
               visa dar suporte e facilitar na confecção das consultas.
            </li>
            <li>
               Será neste campo que você digitará a consulta que deseja fazer (siga para a seção
               "Avisos" para algumas diretivas de boa utilização do sistema).
            </li>
            <li>
               Botões que, de cima para baixo, realiza: o envio da consulta, o download do conteúdo
               digitado, e a navegação até a página em que se encontra.
            </li>
         </ol>

         <h5 className="titleTutorial">
            <strong>ABA "TABELA"</strong>
         </h5>

         <img className="imgTutorial" src={Results} alt="Página de Resultados" />

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

         <img className="imgTutorial" src={Map} alt="Página do Mapa" />

         <br />
         <ol className="listTutorial">
            <li>Controles que permitem o ajuste de zoom do mapa (pode ser feito com scroll).</li>
            <li>
               Botões que, da esquerda pra direita, permitem: a customização dos polígonos (cor de
               preenchimento, tamanho e formato), customização das linhas (cor e grossura), escolha
               do rótulo (coluna) cujos valores serão exibidos no mapa, alternar a visibilidade da
               camada, baixar o geoJSON que gera a camada, e deletar a camada.
            </li>
            <br />
            Importante mencionar que os itens das camadas podem ser reorganizados na lista,
            alterando sua apresentação em mapa.
         </ol>

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
