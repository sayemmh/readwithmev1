import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Button from "../../components/button";
import InboxEditableBlock from "../inboxEditableBlock";
import Notice from "../notice";
import { usePrevious } from "../../hooks";
import { objectId, setCaretToEnd } from "../../utils";
import Card from "../../components/card";
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import InboxIcon from '@material-ui/icons/Inbox';
import { makeStyles } from '@material-ui/core/styles';
import ViewListIcon from '@material-ui/icons/ViewList';
import NotesIcon from '@material-ui/icons/Notes';

const useStyles = makeStyles((theme) => ({
  link: {
    display: 'flex',
    paddingBottom: 20,
  },
  icon: {
    marginRight: theme.spacing(0.5),
    paddingTop: 5,
    width: 25,
    height: 25,
  },
  bc: {
    paddingTop: 10,
    paddingBottom: 10,
  }
}));

// A page is represented by an array containing several blocks
// [
//   {
//     _id: "5f54d75b114c6d176d7e9765",
//     html: "Heading",
//     tag: "h1",
//     imageUrl: "",
//   },
//   {
//     _id: "5f54d75b114c6d176d7e9766",
//     html: "I am a <strong>paragraph</strong>",
//     tag: "p",
//     imageUrl: "",
//   },
//     _id: "5f54d75b114c6d176d7e9767",
//     html: "/im",
//     tag: "img",
//     imageUrl: "images/test.png",
//   }
// ]

const InboxPage = ({ id, creatorid, pageIdList, filteredPages, fetchedBlocks, err }) => {
  if (err) {
    return (
      <Notice status="ERROR">
        <h3>Something went wrong 💔</h3>
        <p>Have you tried to restart the app at '/' ?</p>
      </Notice>
    );
  }
  const initialPages = filteredPages || [];
  const [cards, setCards] = useState(initialPages.map((data) => data.page));
  const [showInbox, setShowInbox] = useState(true)
  const [showRL, setShowRL] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const router = useRouter();
  const [blocks, setBlocks] = useState(fetchedBlocks);
  const [currentBlockId, setCurrentBlockId] = useState(null);
  const classes = useStyles();

  const prevBlocks = usePrevious(blocks);

  // Update the database whenever blocks change
  useEffect(() => {
    const updatePageOnServer = async (blocks) => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API}/users/account/inbox`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blocks: blocks,
            }),
          }
        );
      } catch (err) {
        console.log(err);
      }
    };
    if (prevBlocks && prevBlocks !== blocks) {
      updatePageOnServer(blocks);
    }
  }, [blocks, prevBlocks]);

  // Handling the cursor and focus on adding and deleting blocks
  useEffect(() => {
    // If a new block was added, move the caret to it
    if (prevBlocks && prevBlocks.length + 1 === blocks.length) {
      const nextBlockPosition =
        blocks.map((b) => b._id).indexOf(currentBlockId) + 1 + 1;
      const nextBlock = document.querySelector(
        `[data-position="${nextBlockPosition}"]`
      );
      if (nextBlock) {
        nextBlock.focus();
      }
    }
    // If a block was deleted, move the caret to the end of the last block
    if (prevBlocks && prevBlocks.length - 1 === blocks.length) {
      const lastBlockPosition = prevBlocks
        .map((b) => b._id)
        .indexOf(currentBlockId);
      const lastBlock = document.querySelector(
        `[data-position="${lastBlockPosition}"]`
      );
      if (lastBlock) {
        setCaretToEnd(lastBlock);
      }
    }
  }, [blocks, prevBlocks, currentBlockId]);

  const deleteImageOnServer = async (imageUrl) => {
    // The imageUrl contains images/name.jpg, hence we do not need
    // to explicitly add the /images endpoint in the API url
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/pages/${imageUrl}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      await response.json();
    } catch (err) {
      console.log(err);
    }
  };

  const updateBlockHandler = (currentBlock) => {
    const index = blocks.map((b) => b._id).indexOf(currentBlock.id);
    const oldBlock = blocks[index];
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      tag: currentBlock.tag,
      html: currentBlock.html,
      html2: currentBlock.html2,
      imageUrl: currentBlock.imageUrl,
      displayText: currentBlock.displayText,
      protocol: currentBlock.protocol,
      hostname: currentBlock.hostname,
      pathname: currentBlock.pathname,
    };
    setBlocks(updatedBlocks);
    // If the image has been changed, we have to delete the
    // old image file on the server
    if (oldBlock.imageUrl && oldBlock.imageUrl !== currentBlock.imageUrl) {
      deleteImageOnServer(oldBlock.imageUrl);
    }
  };

  const addBlockHandler = (currentBlock) => {
    setCurrentBlockId(currentBlock.id);
    const index = blocks.map((b) => b._id).indexOf(currentBlock.id);
    console.log(index)
    console.log(blocks)
    
    const updatedBlocks = [...blocks];
    const newBlock =  {  
                        _id: objectId(), 
                        tag: "p",
                        html: "",
                        html2: "",
                        imageUrl: "",
                        displayText:"",
                        protocol: "" 
                      };
    updatedBlocks.splice(index + 1, 0, newBlock);
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      tag: currentBlock.tag,
      html: currentBlock.html,
      html2: currentBlock.html2,
      imageUrl: currentBlock.imageUrl,
      displayText: currentBlock.displayText,
      protocol: currentBlock.protocol,
      hostname: currentBlock.hostname,
      pathname: currentBlock.pathname,
    };
    setBlocks(updatedBlocks);
  };

  function addBlockToEndHandler2() {
    console.log("addBlockHandler2")
    let index = blocks.length - 1;

    let currentBlock = blocks[blocks.length - 1]
    setCurrentBlockId(currentBlock.id);
    console.log(currentBlock)
    console.log(index)
    console.log(blocks)
    const updatedBlocks = [...blocks];
    console.log("updatedBlocks")
    console.log(updatedBlocks)
    // const newBlock = { _id: objectId(), tag: "p", html: "", imageUrl: "" };
    // console.log(blocks)
    // console.log(updatedBlocks)
    // console.log(index)
    // updatedBlocks.splice(index + 1, 0, newBlock);
    // updatedBlocks[index] = {
    //   ...updatedBlocks[index],
    //   tag: currentBlock.tag,
    //   html: currentBlock.html,
    //   imageUrl: currentBlock.imageUrl,
    // };
    // setBlocks(updatedBlocks);
  }

  const deleteBlockHandler = (currentBlock) => {
    if (blocks.length > 1) {
      setCurrentBlockId(currentBlock.id);
      const index = blocks.map((b) => b._id).indexOf(currentBlock.id);
      const deletedBlock = blocks[index];
      const updatedBlocks = [...blocks];
      updatedBlocks.splice(index, 1);
      setBlocks(updatedBlocks);
      // If the deleted block was an image block, we have to delete
      // the image file on the server
      if (deletedBlock.tag === "img" && deletedBlock.imageUrl) {
        deleteImageOnServer(deletedBlock.imageUrl);
      }
    }
  };

  const onDragEndHandler = (result) => {
    const { destination, source } = result;

    // If we don't have a destination (due to dropping outside the droppable)
    // or the destination hasn't changed, we change nothing
    if (!destination || destination.index === source.index) {
      return;
    }

    const updatedBlocks = [...blocks];
    const removedBlocks = updatedBlocks.splice(source.index - 1, 1);
    updatedBlocks.splice(destination.index - 1, 0, removedBlocks[0]);
    setBlocks(updatedBlocks);
  };

  function handleInbox() {
    router.push('/' + id);
  }

  function handleRL() {
    router.push('/' + id + "/rlists");
  }

  function handleNotes () {
    router.push('/' + id + "/notes");
  }

  return (
    <>
      <h1 className="pageHeading">Welcome, {creatorid}! </h1>
      <Breadcrumbs separator="/">
        <Link color="inherit" style={{fontSize:"2em", cursor:"pointer"}} onClick={handleInbox}>
          <InboxIcon className={classes.icon} />
          Inbox
        </Link>
        <Link color="inherit" style={{fontSize:"1.1em", cursor:"pointer"}} onClick={handleRL}>
          <ViewListIcon className={classes.icon} />
          Reading Lists
        </Link>
        <Link color="inherit" style={{fontSize:"1.1em", cursor:"pointer"}} onClick={handleNotes}>
          <NotesIcon className={classes.icon} />
          Notes
        </Link>

      </Breadcrumbs>
      <br></br>


      {blocks.length !== 0 && (
        <Notice style={{ marginBottom: "2rem" }}>
          <p>You have {blocks.length} unread items in your inbox.</p>
        </Notice>
      )}

      {blocks.length === 0 && (
        <Notice style={{ marginBottom: "2rem" }}>
          <p>You have 0 unread items in your inbox. Add items here or via the browser extension!</p>
        </Notice>
      )}

      {/* {cards.length === 0 && (
          <Notice style={{ marginBottom: "2rem" }}>
            <h3>Let's go!</h3>
            <p>Seems like you haven't created any pages so far.</p>
            <p>How about starting now?</p>
          </Notice>
        )} */}
        
      <DragDropContext onDragEnd={onDragEndHandler}>
        <Droppable droppableId={id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {blocks.map((block) => {
                const position =
                  blocks.map((b) => b._id).indexOf(block._id) + 1;
                return (
                  <>
                  <InboxEditableBlock
                    key={block._id}
                    position={position}
                    id={block._id}
                    tag={block.tag}
                    html={block.html}
                    html2={block.html2}
                    imageUrl={block.imageUrl}
                    pageId={id}
                    addBlock={addBlockHandler}
                    deleteBlock={deleteBlockHandler}
                    updateBlock={updateBlockHandler}
                  />

                  </>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <br></br>
    </>
  );
};

export default InboxPage;
