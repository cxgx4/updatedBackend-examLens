import sys
from pathlib import Path
backend_dir = Path(r"c:\Users\cherr\Desktop\final_examLens\backend")
sys.path.insert(0, str(backend_dir))

from app.database import get_engine
from sqlalchemy.orm import Session
from app.models import Topic, Question, Note, Flashcard, NoteTopic, Document

engine = get_engine()

with Session(engine) as session:
    print("--- 1. Adding Neural Network & Deep Learning Syllabus Topics ---")
    nndl_topics = [
        ("NNDL-01", "Artificial Neurons, Weights, Biases & Perceptron (XOR Problem)", "Unit 1: Perceptrons"),
        ("NNDL-02", "Multilayer Perceptron (MLP) & Activation Functions (Sigmoid, Tanh, ReLU)", "Unit 2: Feedforward Networks"),
        ("NNDL-03", "Optimization, Stochastic Gradient Descent (SGD) & Convergence", "Unit 3: Optimization"),
        ("NNDL-04", "Deep Network Training, Normalization (Batch Norm) & Generalization", "Unit 4: Deep Learning Training"),
        ("NNDL-05", "Convolutional Neural Networks (CNN), Stride, Padding & Convolutions", "Unit 5: CNN Architecture"),
    ]
    
    topic_objs = {}
    for code, name, unit in nndl_topics:
        existing = session.query(Topic).filter_by(topic_code=code).first()
        if not existing:
            new_t = Topic(topic_code=code, name=name, syllabus_unit=unit)
            session.add(new_t)
            session.flush()
            topic_objs[code] = new_t
            print(f"  Added topic: {code} - {name}")
        else:
            topic_objs[code] = existing
            print(f"  Existing topic: {code}")

    session.commit()

    print("\n--- 2. Mapping Exam Questions to Topics & Setting Marks ---")
    questions = session.query(Question).all()
    for q in questions:
        text_lower = q.text.lower()
        q.marks = 2 # Each question carries 2 marks as stated on Part A
        q.year = 2025
        q.exam_type = "End Semester Sessional"
        q.section = "Part A"
        
        if "xor" in text_lower or "weights and" in text_lower or "perceptron" in text_lower and "single-neuron" not in text_lower:
            q.topic_id = topic_objs["NNDL-01"].id
        elif "activation" in text_lower or "sigmoid" in text_lower or "tanh" in text_lower or "mlp" in text_lower:
            q.topic_id = topic_objs["NNDL-02"].id
        elif "gradient descent" in text_lower or "sgd" in text_lower or "stochastic" in text_lower:
            q.topic_id = topic_objs["NNDL-03"].id
        elif "normalization" in text_lower:
            q.topic_id = topic_objs["NNDL-04"].id
        elif "stride" in text_lower or "convolutional" in text_lower:
            q.topic_id = topic_objs["NNDL-05"].id
        else:
            q.topic_id = topic_objs["NNDL-01"].id
            
        print(f"  Q#{q.id} mapped to Topic ID {q.topic_id} ({q.text[:40]}...)")
    
    session.commit()

    print("\n--- 3. Creating Note & Flashcards for NNDL Concepts ---")
    doc2 = session.query(Document).filter(Document.id >= 2).first()
    doc_id = doc2.id if doc2 else 1
    
    nndl_note = session.query(Note).filter_by(document_id=doc_id).first()
    if not nndl_note:
        nndl_note = Note(
            document_id=doc_id,
            page=1,
            lecture_date="2025-10-31",
            text="Neural Network and Deep Learning Core Principles: Perceptrons, Weights, Biases, Activation Functions, SGD Optimization, and Convolutional Strides.",
            structured_content="## Neural Network and Deep Learning Summary\n- **Perceptrons**: Linear classifiers; cannot solve XOR without hidden layers.\n- **Weights & Biases**: Weights determine signal importance; bias shifts decision threshold.\n- **Activation Functions**: Introduce non-linearity (Sigmoid, Tanh, ReLU).\n- **SGD**: Updates weights iteratively using stochastic gradient estimates.\n- **Stride in CNN**: Determines filter step size and output spatial downsampling.",
            confidence=0.98
        )
        session.add(nndl_note)
        session.flush()

    # Link note to topics
    for code, t in topic_objs.items():
        if not session.query(NoteTopic).filter_by(note_id=nndl_note.id, topic_id=t.id).first():
            session.add(NoteTopic(note_id=nndl_note.id, topic_id=t.id, confidence=0.95))

    # Generate Flashcards
    cards_data = [
        (
            "Why is a single-layer perceptron unable to solve the XOR problem?",
            "A single-layer perceptron can only form linear decision boundaries (hyperplanes). The XOR function is non-linearly separable and requires at least one hidden layer or non-linear feature mapping.",
            "NNDL-01"
        ),
        (
            "What is the difference between weights and biases in an artificial neuron?",
            "Weights scale the strength of each input feature (controlling the slope/orientation of the decision boundary), while the bias shifts the activation threshold independently of the inputs.",
            "NNDL-01"
        ),
        (
            "How do activation functions influence gradient flow in deep neural networks?",
            "They introduce non-linearity. Saturated activations (like Sigmoid or Tanh) cause vanishing gradients when inputs are large, while non-saturating activations (like ReLU) preserve gradient flow for deeper architectures.",
            "NNDL-02"
        ),
        (
            "Compare Batch GD, Mini-batch GD, and Stochastic Gradient Descent (SGD).",
            "Batch GD computes gradients over the whole dataset (slow, smooth). SGD updates per single sample (fast, high variance). Mini-batch GD updates over small batches (e.g., 32-128 samples), balancing stability and hardware speed.",
            "NNDL-03"
        ),
        (
            "What is the role of stride in a convolutional neural network (CNN) layer?",
            "Stride defines how many pixels the kernel slides across the input tensor at each step. Increasing the stride downsamples the feature map, reducing spatial resolution and computational load.",
            "NNDL-05"
        )
    ]

    for front, back, code in cards_data:
        q_linked = session.query(Question).filter(Question.topic_id == topic_objs[code].id).first()
        q_id = q_linked.id if q_linked else None
        
        card = session.query(Flashcard).filter_by(front=front).first()
        if not card:
            card = Flashcard(
                note_id=nndl_note.id,
                front=front,
                back=back,
                linked_question_id=q_id
            )
            session.add(card)
            print(f"  Created card: '{front[:45]}...'")

    session.commit()
    print("\n--- Done! NNDL Topics, Question mappings, and Flashcards successfully linked! ---")
