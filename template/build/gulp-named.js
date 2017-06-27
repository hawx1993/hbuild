/**
 * Created by trigkit4 on 2017/6/27.
 */
import gulp from 'gulp'

export const task = (...args) => {
    return gulp.task(...args)
}

export const input = (...args) => {
    return gulp.src(...args)
}

export const output = (...args) => {
    return gulp.dest(...args)
}

export const start = (...args) => {
    return gulp.start(...args)
}
