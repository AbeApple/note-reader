import React, { useEffect, useRef, useState } from 'react'
import "./Titles.css"
import playIcon from "../../Images/playIconS.png"
import editIcon from "../../Images/editIconS.png"
import folderIcon from "../../Images/folderIcon2.png"
import backIcon from "../../Images/backIconS.png"
import Folder from './Folder/Folder'
import { useDispatch, useSelector } from 'react-redux'
import { createNewFolder, editNote, openNote, setEditingFolder, setItemToAdd, setNoteData, setPage } from '../../Redux/AppSlice'
import { push, ref, set } from 'firebase/database'

function Titles(props) {  
  const [filteredNoteArray, setFilteredNoteArray] = useState()
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [titleMatches, setTitleMatches] = useState()
  const [contentMatches, setContentMatches] = useState()
  const searchInput = useRef()

  const folderArray = useSelector(state => state.appSlice.folderArray)
  const noteArray = useSelector(state => state.appSlice.noteArray)
  const [parsedFolderArray, setParsedFolderArray] = useState([])
  const [parsedNoteArray, setParsedNoteArray] = useState([])
  const [folderToDisplay, setFolderToDisplay] = useState()

  const dispatcher = useDispatch()

  const dbRef = useSelector(state => state.appSlice.dbRef)
  const uid = useSelector(state => state.appSlice.uid)

  useEffect(()=>{
    placeNotesInFolders()
  },[folderArray, noteArray])

  function placeNotesInFolders(){
    // This array will have items removed when they are found to be contained in a folder
    let tempNotesArray = [...noteArray]
    // This will contain folders with the items attribute filled with note json objecs instead of just indicies
    let newFolderArray = []
    // Go through the folders
    folderArray.forEach(folder => {
      // This will contain the indicies of the notes that belong in this folder
      let indexArray = []
      // Go through the indicies in the folder items indicies array
      if(!folder.items)
        return
      folder.items.forEach(itemKey => {
        // Look for a note with the corresponding id
        for(var i = 0; i<tempNotesArray.length; i++){
          // If the note has the index that matches the item index take note of its index in teh tempNoteArray
          if(tempNotesArray[i].key == itemKey){
            indexArray.push(i)
          }
        }
      })
      // Sort backwards to the pop operation does not change the position of the notes that still need to be put in the folder item array
      indexArray.sort((a, b) => b - a)
      // This is the array of notes that will go into the folder
      let notesInFolderArray = []
      // Put each one into the array
      indexArray.forEach(index => {
        notesInFolderArray.push(tempNotesArray[index])
      })
      // Remove the ones that were added to the folder from the note array
      indexArray.forEach(index => {
        tempNotesArray.splice(index, 1)
      })
      // Push the folder into the new folder array with the array of note objects it contains
      newFolderArray.push({
        key: folder.key,
        name: folder.name,
        items: notesInFolderArray
      })
    })
    // Put the array of folders that contains arrays of note objects in state
    setParsedFolderArray(newFolderArray)
    // The notes that were not placed into folders go in this array
    setParsedNoteArray(tempNotesArray)
  }

  function filterNotesForSearch(){
    var searchValue = searchInput.current.value
    searchValue = searchValue.toLowerCase()

    // If there is a non empty search value search for matches
    if(!searchValue || searchValue.replace(" ","") === ""){
      setShowSearchResults(false)
      return
    }    

    var titleMatches = []
    var contentMatches = []
    noteArray.forEach(note => {
      if(note.title?.toLowerCase()?.includes(searchValue))
        titleMatches.push(note)
      if(note.content?.toLowerCase()?.includes(searchValue))
        contentMatches.push(note)
    })
    setTitleMatches(titleMatches)
    setContentMatches(contentMatches)
    setShowSearchResults(true)
  }
  function openAndPlay(noteData, event){
    dispatcher(openNote({noteData: noteData, playOnLoad: true, event: event}))
  }
  // This runs once when the note is first dragged
  function dragStart(_noteId, e){
    dispatcher(setItemToAdd(_noteId))
    
  }
  function notesFromFolder(){
    if(!folderToDisplay)
      return parsedNoteArray
    else{
      let notesToReturn = []
      parsedFolderArray.forEach(folder => {
        if(folder.key === folderToDisplay)
          notesToReturn = folder.items
      })
      return notesToReturn
    }
  }
  function foldersFromFolder(){    
    if(!folderToDisplay)
      return folderArray
    else
      return []
  }
  return (
    <div className='titlesContainer'>
        <div className='searchInput'>
          <input ref={searchInput} onChange={filterNotesForSearch} placeholder="Search"></input>
        </div>
        {showSearchResults?
          <div>
            <div className='searchResults'>
              <div className='searchResultsTitle'>Title Matches</div>
              {titleMatches.map(noteData => (
              <div className='titleBox' onClick={() => openNote({noteData: noteData})}>
                <div className='titleBoxInner'>
                  {noteData.title}              
                </div>
                  <div className='editButton' onClick={(event) => dispatcher(editNote({noteData: noteData, event: event}))}>
                    Edit
                  </div>
                </div>
              ))}
            </div>
            <div className='searchResults'>
              <div className='searchResultsTitle'>Content Matches</div>
              {contentMatches.map(noteData => (
                <div className='titleBox' onClick={() =>dispatcher(openNote({noteData: noteData}))}>
                  <div className='titleBoxInner'>
                    {noteData.title}              
                  </div>
                  <div className='editButton' onClick={(event) => dispatcher(editNote({noteData: noteData, event: event}))}>
                    Edit
                  </div>
                </div>
              ))}
            </div>
          </div>
        :
        <div>
          {!folderToDisplay ?
          <div style={{display: "inline-block"}}>
            <div className='titleBox' onClick={(event) => dispatcher(editNote({noteData: null, event: event}))}>
              <div className='titleBoxInner newNoteBox'>
                <div>
                  New Note
                </div>
              </div>
            </div>
            <div className='titleBox newFolder' onClick={(event) => dispatcher(createNewFolder())}>
                <div className='newFolderInner'>
                  New Folder
                </div>
                <img src={folderIcon}></img>            
            </div>
          </div>
          :
          <div onClick={()=>setFolderToDisplay(null)} className='titleBox backBox'>
            <img src={backIcon}></img>
          </div>
          }
          {foldersFromFolder().map(folderData => (
            <Folder folderData={folderData} setFolderToDisplay={setFolderToDisplay}></Folder>
          ))}
          {notesFromFolder().map(noteData => (
            <div className='titleBox' onClick={() => dispatcher(openNote({noteData  : noteData}))} draggable={true} key={noteData.key} id={"note_" + noteData.key} onDragStart={e=>dragStart(noteData.key, e)}>
              <div className='titleBoxInner'>
                {noteData.title}              
              </div>
              <div className='titleButtonContainer'>
                <div className='titleButton' onClick={(event) => dispatcher(editNote({noteData: noteData, event: event}))}>
                  <img src={editIcon}></img>
                </div>
                <div className='titleButton' onClick={e => openAndPlay({noteData: noteData, playOnLoad: true, event: e})}>
                <img src={playIcon}></img>
                </div>
              </div>
            </div>
          ))}
        </div>
        }
    </div>
  )
}

Titles.defaultProps = {
    noteArray: [],
    openNote: (_input) => {console.log("opening note"); console.log(_input);}
}

export default Titles