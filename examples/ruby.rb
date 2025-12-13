# frozen_string_literal: true

require 'json'
require 'date'

# Represents a blog post
class BlogPost
  attr_accessor :id, :title, :content, :author, :tags
  attr_reader :created_at, :published_at

  def initialize(id:, title:, content:, author:)
    @id = id
    @title = title
    @content = content
    @author = author
    @tags = []
    @created_at = DateTime.now
    @published_at = nil
    @published = false
  end

  def publish
    return if @published

    @published = true
    @published_at = DateTime.now
  end

  def published?
    @published
  end

  def add_tag(tag)
    @tags << tag unless @tags.include?(tag)
  end

  def word_count
    @content.split.length
  end

  def summary(length = 100)
    @content.length > length ? "#{@content[0...length]}..." : @content
  end

  def to_h
    {
      id: @id,
      title: @title,
      content: @content,
      author: @author,
      tags: @tags,
      created_at: @created_at.iso8601,
      published_at: @published_at&.iso8601,
      published: @published,
      word_count: word_count
    }
  end

  def to_json(*args)
    to_h.to_json(*args)
  end
end

# Blog management system
class Blog
  attr_reader :posts

  def initialize(name)
    @name = name
    @posts = []
    @next_id = 1
  end

  def create_post(title:, content:, author:)
    post = BlogPost.new(
      id: @next_id,
      title: title,
      content: content,
      author: author
    )
    @posts << post
    @next_id += 1
    post
  end

  def find_post(id)
    @posts.find { |post| post.id == id }
  end

  def published_posts
    @posts.select(&:published?)
  end

  def posts_by_author(author)
    @posts.select { |post| post.author == author }
  end

  def posts_by_tag(tag)
    @posts.select { |post| post.tags.include?(tag) }
  end

  def delete_post(id)
    @posts.reject! { |post| post.id == id }
  end

  def stats
    {
      total_posts: @posts.length,
      published: published_posts.length,
      draft: @posts.length - published_posts.length,
      total_words: @posts.sum(&:word_count)
    }
  end
end

# Demo
blog = Blog.new('Tech Blog')

# Create posts
post1 = blog.create_post(
  title: 'Getting Started with Ruby',
  content: 'Ruby is a dynamic, open-source programming language with a focus on simplicity and productivity.',
  author: 'Alice Johnson'
)
post1.add_tag('ruby')
post1.add_tag('programming')
post1.publish

post2 = blog.create_post(
  title: 'Neomono Theme Review',
  content: 'Neomono is a vibrant, futuristic dark theme with neon accents for modern developers.',
  author: 'Bob Smith'
)
post2.add_tag('vscode')
post2.add_tag('themes')

puts "Blog Statistics:"
puts blog.stats.map { |k, v| "  #{k}: #{v}" }.join("\n")

puts "\nPublished Posts:"
blog.published_posts.each do |post|
  puts "  - #{post.title} by #{post.author}"
  puts "    Tags: #{post.tags.join(', ')}"
  puts "    Words: #{post.word_count}"
end

