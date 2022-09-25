import { Button, Modal } from 'react-bootstrap';
import React, { Component } from 'react';
import { jsPDF } from 'jspdf';
import humanizeDuration from 'humanize-duration';

export default class DownloadButton extends Component {
    state = {
        preview: '',
    };

    handleDownload = () => {
        const doc = new jsPDF('p', 'px', 'a4'),
            { attempt } = this.props,
            maxWidth = doc.internal.pageSize.getWidth(),
            maxHeight = doc.internal.pageSize.getHeight(),
            baseUnit = 9,
            cCyan = '#f5fafd',
            cGreenBg = '#eafaf5',
            cGreen = '#2fcca1',
            cOrange = '#ffbb69',
            cWhite = '#fff',
            cBlack = '#000',
            correctAnswers = attempt.answers.reduce((count, val, index) => {
                if (attempt.questions[index].correctOptionIdx === val) {
                    count++;
                }
                return count;
            }, 0),
            resultText = `You have scored ${Math.round(
                (correctAnswers / attempt.questions.length) * 100
            )} % (${correctAnswers}/${attempt.questions.length}) in ${humanizeDuration(attempt.spentTime * 60000, {
                round: true,
            })}`;

        doc.setFillColor(cCyan);
        doc.rect(0, 0, maxWidth, baseUnit * 3.6, 'F');

        doc.setFontSize(baseUnit * 1.4);
        doc.setFont('helvetica', 'bold');
        doc.text(`Attempt #${attempt._id.toUpperCase()} answers`, baseUnit * 1.2, baseUnit * 2.1);

        doc.setFontSize(baseUnit);
        doc.setFont('helvetica', 'normal');

        const { w: wResult } = doc.getTextDimensions(resultText);

        doc.text(resultText, maxWidth - wResult - baseUnit * 1.2, baseUnit * 2.1);

        let yAxis = baseUnit * 5.6;

        for (const questionIndex in attempt.questions) {
            doc.setFontSize(baseUnit * 1.2);

            const question = attempt.questions[questionIndex],
                text = doc.splitTextToSize(
                    `${parseInt(questionIndex) + 1}. ${question.title}`,
                    maxWidth - baseUnit * 6
                ),
                { h } = doc.getTextDimensions(text);

            doc.setFont('helvetica', 'bold');
            doc.text(text, baseUnit * 1.2, yAxis);
            yAxis += h + baseUnit * 1.2;

            for (const optionIndex in question.options) {
                doc.setFontSize(baseUnit * 1);

                let text = doc.splitTextToSize(
                    question.options[optionIndex] +
                        (attempt.answers[questionIndex] == optionIndex ? ' - Your answer' : ''),
                    maxWidth - baseUnit * 10
                );
                const { h } = doc.getTextDimensions(text);

                // mark the correct option with a green background and text
                if (question.correctOptionIdx == optionIndex) {
                    doc.setFillColor(cGreenBg);
                    doc.rect(baseUnit, yAxis - 10, maxWidth - baseUnit * 2, h + 9, 'F');

                    const text = 'Correct answer',
                        { w } = doc.getTextDimensions(text);
                    doc.setFont('helvetica', 'bold');
                    doc.text(text, maxWidth - baseUnit * 2.4 - w, yAxis);
                }

                // set the colors & line width for the "checkbox"
                doc.setFillColor(cWhite);
                doc.setDrawColor(cBlack);
                doc.setLineWidth(0.6);
                doc.circle(baseUnit * 2, yAxis - 2.5, baseUnit * 0.36, 'DF');

                // mark the selected option
                if (attempt.answers[questionIndex] == optionIndex) {
                    doc.setFillColor(cBlack);
                    doc.circle(baseUnit * 2, yAxis - 2.5, baseUnit * 0.22, 'F');
                }

                // type the option
                doc.setFont('helvetica', 'normal');
                doc.text(text, baseUnit * 3, yAxis);

                yAxis += h + baseUnit;
            }

            // add admin message
            const heading =
                    attempt.answers[questionIndex] === question.correctOptionIdx ? `Correct answer!` : `Wrong answer`,
                message = doc.splitTextToSize(
                    attempt.answers[questionIndex] === question.correctOptionIdx
                        ? question.msgIfCorrect
                        : question.msgIfWrong,
                    maxWidth - baseUnit * 2.7
                ),
                { h: h1 } = doc.getTextDimensions(heading),
                { h: h2 } = doc.getTextDimensions(message),
                hTotal = h1 + h2 + baseUnit * 2;

            doc.setFillColor(cCyan);
            doc.rect(baseUnit, yAxis, maxWidth - baseUnit * 2, hTotal, 'F');
            doc.setFillColor(attempt.answers[questionIndex] === question.correctOptionIdx ? cGreen : cOrange);
            doc.rect(baseUnit, yAxis, 3, hTotal, 'F');

            doc.setFont('helvetica', 'bold');
            doc.text(heading, baseUnit * 1.4 + 3, yAxis + baseUnit * 1.2);

            doc.setFont('helvetica', 'normal');
            doc.text(message, baseUnit * 1.4 + 3, yAxis + baseUnit * 1.8 + h1);

            yAxis += hTotal + baseUnit * 2;

            if (yAxis > maxHeight - 140) {
                yAxis = 20;
                doc.addPage();
            }
        }

        doc.save(`attempt-${attempt._id}.pdf`);
    };

    render() {
        return (
            <Button className='bd mr-2' onClick={this.handleDownload}>
                Download
            </Button>
        );
    }
}

