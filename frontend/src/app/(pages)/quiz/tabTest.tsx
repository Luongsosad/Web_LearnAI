// components/tabTest.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Lightbulb, Globe } from 'lucide-react';
import LoadedOverlay from '@/components/LoadedOverlay';

interface Question {
	word_id: number;
	english_sentence: string;
	vietnamese_translation: string;
	answer: string;
	hint: string;
	reference_sentences?: string[];
}

interface TestProps {
	selectedTest: string;
	selectedCategory: string;
	category_id: number;
	topic_id: number;
	setTab: (tab: number) => void;
}

const Test: React.FC<TestProps> = ({ selectedTest, selectedCategory, category_id, topic_id, setTab }) => {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswer, setUserAnswer] = useState('');
	const [feedback, setFeedback] = useState('');
	const [showHint, setShowHint] = useState(false);
	const [showTranslation, setShowTranslation] = useState(false);
	const isLoaded = useRef(false);

	useEffect(() => {
		const fetchQuestions = async () => {
			if (isLoaded.current) return; // Prevent multiple fetches
			isLoaded.current = true; // Mark as loaded to prevent multiple fetches
			try {
				setLoading(true);
				const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/w/generate-questions`, {
					params: { category_id, topic_id },
					withCredentials: true,
				});
				setQuestions(res.data.questions);
			} catch (err) {
				console.error('Error fetching test questions:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchQuestions();
	}, [topic_id]);

	const handleAnswerSubmit = () => {
		const currentQuestion = questions[currentQuestionIndex];
		if (userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
			setFeedback('Đúng!');
		} else {
			setFeedback(`Sai! Đáp án đúng là: ${currentQuestion.answer}`);
		}
		setShowHint(true);
		setShowTranslation(true);
	};

	const handleNextQuestion = () => {
		setFeedback('');
		setUserAnswer('');
		setShowHint(false);
		setShowTranslation(false);
		setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
	};

	if (loading) return <LoadedOverlay />;
	if (questions.length === 0) return <div>Không có câu hỏi nào!</div>;

	const currentQuestion = questions[currentQuestionIndex];

	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-[16px] font-semibold">Nội dung: {selectedTest} - {selectedCategory} | {questions && `${questions.length}`}</h2>
			<div className="p-4 bg-[#323232] rounded-lg max-h-screen custom-scroll pb-[170px] md:pb-[10px]">
				<p><strong>Câu hỏi:</strong> {currentQuestion.english_sentence}</p>

				<div className="flex gap-4 mt-2">
					{/* Nút toggle gợi ý */}
					<div className="relative group">
						<button
							onClick={() => setShowHint(!showHint)}
							className="text-gray-400 hover:text-white"
							aria-label={showHint ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
						>
							<Lightbulb size={20} className='text-yellow-500' />
						</button>
						{/* <span className="absolute left-0 top-8 hidden group-hover:block bg-[#444444] text-white text-xs rounded px-2 py-1 -translate-x-1/2">
              {showHint ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
            </span> */}
					</div>

					{/* Nút toggle dịch nghĩa */}
					<div className="relative group">
						<button
							onClick={() => setShowTranslation(!showTranslation)}
							className="text-gray-400 hover:text-white"
							aria-label={showTranslation ? 'Ẩn dịch nghĩa' : 'Hiện dịch nghĩa'}
						>
							<Globe size={20} />
						</button>
						{/* <span className="absolute left-0 top-8 hidden group-hover:block bg-[#444444] text-white text-xs rounded px-2 py-1 -translate-x-1/2">
              {showTranslation ? 'Ẩn dịch nghĩa' : 'Hiện dịch nghĩa'}
            </span> */}
					</div>
				</div>

				{showTranslation && (
					<p className="mt-2"><strong>Dịch nghĩa:</strong> {currentQuestion.vietnamese_translation}</p>
				)}
				{showHint && (
					<p className="mt-2"><strong>Gợi ý:</strong> {currentQuestion.hint}</p>
				)}

				<input
					type="text"
					value={userAnswer}
					onChange={(e) => setUserAnswer(e.target.value)}
					className="mt-2 p-2 bg-[#444444] text-white rounded-lg w-full"
					placeholder="Nhập đáp án"
					disabled={!!feedback}
				/>
				<div className="flex gap-2 mt-2">
					<button
						onClick={handleAnswerSubmit}
						className={`p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white ${feedback ? 'opacity-50 cursor-not-allowed' : ''}`}
						disabled={!!feedback}
					>
						Kiểm tra
					</button>
					<button
						onClick={handleNextQuestion}
						className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white"
					>
						Câu tiếp theo
					</button>
					<button
						onClick={() => setTab(2)}
						className="p-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white"
					>
						Quay lại
					</button>
				</div>
				{feedback && (
					<div className="mt-2">
						<p className="text-lg text-red-500">{feedback}</p>
						{currentQuestion.reference_sentences && (
							<div className="mt-2">
								<p><strong>Câu tham khảo:</strong></p>
								<ul className="list-disc ml-4">
									{currentQuestion.reference_sentences.map((sentence, idx) => (
										<li key={idx}>{sentence}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Test;