import React from 'react'
import { Button, Modal } from 'react-bootstrap'

const DeleteConfirmationModal = ({show, onHide, onConfirm, loading = false, questionTitle = 'this question'}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <p>{`Are You Sure You Want to delete ${questionTitle}?`}</p>
            <p className = 'text-muted small'>This action cannot be undone. All answers associated with this question will also be deleted.</p>
        </Modal.Body>

        <Modal.Footer>
            <Button variant = 'secondary' onClick = {onHide} disabled = {loading}>
                cancel
            </Button>

            <Button variant="danger" onClick={onConfirm} disabled={loading}>
                {loading ? 'Deleting...' : 'Yes, Delete'}
            </Button>
        </Modal.Footer>



    </Modal>
  )
}

export default DeleteConfirmationModal