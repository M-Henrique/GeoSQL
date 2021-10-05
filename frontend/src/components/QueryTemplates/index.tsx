import React, { useContext, useState, useCallback } from 'react';

import ReactModal from 'react-modal';

import TablesContext from '../../contexts/tables';

import './styles.css';

export default function QueryTemplates() {
   const { templates } = useContext(TablesContext);

   const [isModalOpen, setIsModalOpen] = useState(false);

   const [title, setTitle] = useState('');
   const [group, setGroup] = useState('');
   const [prototype, setPrototype] = useState('');
   const [description, setDescription] = useState('');

   const handleModal = useCallback(
      (newTitle: string, newGroup: string, newPrototype: string, newDescription: string) => {
         setTitle(newTitle);
         setGroup(newGroup);
         setPrototype(newPrototype);
         setDescription(newDescription);

         setIsModalOpen(true);
      },
      []
   );

   return (
      <div id="templatesContainer" className="container">
         <span>REFERÊNCIAS</span>
         <ul>
            {templates.map(({ item, group, title, prototype, description }, index: number) => (
               <li
                  key={index}
                  title={prototype}
                  onClick={() => handleModal(title, group, prototype, description)}
               >
                  {item} - {prototype ? prototype : title}
               </li>
            ))}
         </ul>

         <ReactModal
            isOpen={isModalOpen}
            style={{
               content: {
                  display: 'grid',
                  gridTemplateRows: '1fr 0.1fr',
                  fontSize: '1.5rem',
                  textIndent: '2rem',
               },
            }}
         >
            <div>
               <span style={{ display: 'flex', justifyContent: 'center' }}>
                  <b>{title}</b>
               </span>

               <span>
                  <b>Grupo:</b>
               </span>
               <p> {group}</p>

               <br />

               <span>
                  <b>Protótipo:</b>
               </span>
               <p> {prototype}</p>

               <br />

               <span>
                  <b>Descrição:</b>
               </span>
               <p> {description}</p>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
               <button id="modalButton" onClick={() => setIsModalOpen(false)}>
                  OK
               </button>
            </div>
         </ReactModal>
      </div>
   );
}
