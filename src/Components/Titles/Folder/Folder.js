import { ref, set, update } from 'firebase/database'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import folderIcon from "../../../Images/folderIcon2.png"
import settingsIcon from "../../../Images/settingsIconS.png"
import { addItemToFolder, deleteFolder, setEditingFolder, setFolderToDisplayId, updateFolderName } from '../../../Redux/AppSlice'

function Folder({folderData}) {
    
    const folderNameInput = useRef()

    const uid = useSelector(state => state.appSlice.uid)
    const dbRef = useSelector(state => state.appSlice.dbRef)
    const folderArray = useSelector(state => state.appSlice.folderArray)
    const editingFolderId = useSelector(state => state.appSlice.editingFolderId)

    const dispatcher = useDispatch()

    useEffect(()=>{
        if(editingFolderId == folderData.key)
            setTimeout(() => {
                const inputElement = document.getElementById(folderData.key+"nameInput")
                if(inputElement)
                inputElement.focus()
            }, 250);
    },[editingFolderId])

    function updateFolderNameFunction(_folderKey, e){
        dispatcher(updateFolderName({event: e}))
      }
    // function addItemToFolder(_folderKey, _itemId){
    //     // Get the folders currently in this folder as an array of ids
    //     let tempArray = []
    //     folderArray.forEach(folder => {
    //         if(folder.key == _folderKey)
    //         if(folder.items)
    //             tempArray = folder.items
    //     })
    //     // Add the new id to the array
    //     tempArray.push(_itemId)
    //     // Update the array in the db
    //     update(ref(dbRef, "noteApp/" + uid + "/folders/" + _folderKey), {items: tempArray})
    
    // }
    function removeItemFromFolder(_itemId){

    }

    function editFolderName(_folderKey, e){
        e.stopPropagation()    
        dispatcher(setEditingFolder(_folderKey))        
    }
    function deleteFolderFunction(_folderKey, e){
        e.stopPropagation()          
        dispatcher(deleteFolder(_folderKey))
    }
    function openFolder(_folderId){        
        dispatcher(setFolderToDisplayId(_folderId))
    }
    // This function is called when something is dragged and dropped onto the folder
    function handleItemDrop(e){
        console.log("folder drag drop")
        console.log(e.target)
        dispatcher(addItemToFolder(folderData.key))
    }
    // This allows things to be dragged onto the folder
    function handleItemDragOver(e){
        e.preventDefault()
        // console.log("folder drag over")
        // console.log(e.target)
    }
    // This runs once when the folder is first dragged
    function dragStart(e){
        console.log(e.target)
    }
    /*
        onDragEnter gives the values of the component it is on when something else hovers over it

        could put folder key in store when clicking edit name
        then dispatch a function from app.js to update the name on enter press
        can have document.getElementById in the reducer to get the value and use the key to put it in the db, then set the editingFolderNameKey state to null so the input field is not there

        its already in the store
        just need to make the reducer and keydown event listener to dispatch it
        
        newName = document.getElementById(folderData.key+"nameInput")?.value
        update()
        state.editingFolderId = null

        but how would it be saved on a phone? can press enter but not intuitive so maybe should leave the button
    */

  return (
    <div id="folder" className='titleBox newFolder' onClick={()=>openFolder(folderData.key)} key={folderData.key} onDragOver={(e)=>handleItemDragOver(e) } onDrop={e=>handleItemDrop(e)} onDragStart={e=>dragStart(e)} >
        <div className='newFolderInner'>
        {editingFolderId == folderData.key ? 
            <div onClick={e=>e.stopPropagation()}>
                <input placeholder='Folder Name' ref={folderNameInput}  id={folderData.key + "nameInput"} defaultValue={folderData.name}></input>
                {/* <div onClick={e => dispatcher(updateFolderName({event: e}))}>Save</div> */}
                </div>
                :
                <div>
                <div className='settingsGear'>                
                <img src={settingsIcon}></img>
                <div className='folderSettings'>
                    <div className='folderSettingsButton' onClick={e => editFolderName(folderData.key, e)}>Rename</div>
                    <div className='folderSettingsButton' onClick={e => deleteFolderFunction(folderData.key, e)}>Delete</div>
                </div>
            </div>
            {folderData.name}
            </div>
        }
        </div>
        <img src={folderIcon}></img>            
    </div>
  )
}

export default Folder